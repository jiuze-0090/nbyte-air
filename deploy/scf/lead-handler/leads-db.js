'use strict';

/**
 * 留资落库客户端 · WorkBuddy 云数据库（PostgREST 通道）
 * ---------------------------------------------------------------------------
 * 为什么不用 @cloudbase/node-sdk：
 *   本项目的数据库是 WorkBuddy 云服务（PostgREST），不是腾讯云 CloudBase。
 *   两者的库不是同一个实例，SDK 也装不进这个无依赖的函数包。
 *   早前 index.js 里 require('@cloudbase/node-sdk') 必然抛错 → saved 恒为 false，
 *   线索只进了企微群、没进库。现改为直连 WorkBuddy 云库的 REST 通道。
 *
 * 认证方式（实测自 workbuddy-cloud-sdk 的请求构造）：
 *   头 `x-wb-webapp-access-key: <publishableKey>`
 *   注意不是 `apikey` —— 用 apikey 会返回
 *   {"error":"invalid_client","error_description":"the client credential is invalid or revoked"}
 *
 * 匿名（无用户会话）写入能被 RLS 接受，但**读不回来**：
 *   - insert 不带 .select()      → 通过
 *   - insert(...).select()        → 42501（RETURNING 需要 SELECT 策略 = 员工身份）
 *   - insert 缺 consent_at        → 42501（合规闸门，符合预期）
 * 所以这里写完就返回，不做回读。
 *
 * 环境变量：
 *   WB_ENDPOINT        WorkBuddy 云库数据面地址（必填，否则只发企微、不落库）
 *   WB_ACCESS_KEY      publishableKey（必填）
 *   WB_ORG_CODE        机构码，默认 UAV-NEWSKY
 *   LEADS_TABLE        表名，默认 leads
 *   LEAD_PHONE_SECRET  手机号加密密钥（必填）：用 AES-256-GCM 加密手机号
 *   CONSENT_TEXT_VERSION 告知书版本号，默认 v1
 */

const https = require('https');
const crypto = require('crypto');

const WB_ENDPOINT = (process.env.WB_ENDPOINT || '').replace(/\/+$/, '');
const WB_ACCESS_KEY = process.env.WB_ACCESS_KEY || '';
const WB_ORG_CODE = process.env.WB_ORG_CODE || 'UAV-NEWSKY';
const LEADS_TABLE = process.env.LEADS_TABLE || 'leads';
const CONSENT_TEXT_VERSION = process.env.CONSENT_TEXT_VERSION || 'v1';

// 密钥在调用时读取而不是加载时快照——函数环境变量可能被更新，
// 且这样才能测出「密钥缺失时不落明文」这条分支。
function phoneSecret() {
  return process.env.LEAD_PHONE_SECRET || '';
}

/** 手机号归一化：去分隔符，去 +86 前缀，保留 11 位数字 */
function normalizePhone(phone) {
  let p = String(phone || '').replace(/[\s\-()]/g, '');
  if (p.startsWith('+86')) p = p.slice(3);
  else if (p.startsOf && p.startsWith('86') && p.length === 13) p = p.slice(2);
  return p;
}

/** 手机号脱敏：138****0090。管理端列表显示这个，不显示明文也不显示密文 */
function maskPhone(phone) {
  const p = String(phone || '');
  if (p.length !== 11) return p.slice(0, 3) + '****';
  return p.slice(0, 3) + '****' + p.slice(7);
}

/**
 * 手机号加密存储（AES-256-GCM）。
 * 密钥缺失时返回空串——宁可让字段为空，也不要退化成明文落库。
 */
function encryptPhone(phone) {
  const secret = phoneSecret();
  if (!secret) return '';
  try {
    const key = crypto.createHash('sha256').update(secret).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(String(phone), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `gcm:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
  } catch (e) {
    console.error('[lead] 手机号加密失败：', e && e.message);
    return '';
  }
}

/**
 * 去重键：手机号的 SHA-256（带盐）。
 * 同一手机号永远得到同一个值 → 可直接建索引做去重；不可逆推回手机号。
 */
function phoneHash(phone) {
  const salt = phoneSecret() || 'nbyte-lead-dedup';
  return crypto.createHash('sha256').update(`${salt}:${phone}`).digest('hex');
}

/** POST JSON 到 https 地址，返回 { ok, status, body } */
function postJson(urlString, payload, headers = {}) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (e) {
      resolve({ ok: false, status: 0, body: { errmsg: '地址格式不对' } });
      return;
    }
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => {
          raw += c;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = { raw: raw.slice(0, 200) };
          }
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            body: parsed,
          });
        });
      },
    );
    req.on('error', (e) => {
      console.error('[lead] 落库请求异常：', e && e.message);
      resolve({ ok: false, status: 0, body: { errmsg: String(e && e.message) } });
    });
    req.write(body);
    req.end();
  });
}

/**
 * 写入 leads 表。返回 true = 已落库。
 * 缺配置时返回 false（不阻断主流程，企微通知仍然照发）。
 */
async function saveToDatabase(lead) {
  if (!WB_ENDPOINT || !WB_ACCESS_KEY) {
    console.warn('[lead] 未配置 WB_ENDPOINT / WB_ACCESS_KEY，跳过落库（企微通知不受影响）');
    return false;
  }

  const normalized = normalizePhone(lead.phone);
  const row = {
    org_code: WB_ORG_CODE,
    name: lead.name,
    // 加密存储；密钥缺失时留空，绝不退化成明文
    phone_cipher: encryptPhone(normalized),
    // 脱敏串：管理端列表显示这个（够顾问识别，又不是可用的手机号）
    phone_masked: maskPhone(normalized),
    phone_hash: phoneHash(normalized),
    intent: lead.intent || '未填',
    message: lead.message || '',
    source_url: String(lead.source || '').slice(0, 512),
    // 固定为 form —— 从技术上杜绝「其他来源的号码被塞进线索表」
    source_type: 'form',
    platform_session_id: '',
    // 告知同意时间戳：非空是 RLS 的硬性要求，缺失直接被拒
    consent_at: new Date().toISOString(),
    consent_text_version: CONSENT_TEXT_VERSION,
    tier: 'D',
    status: 'active',
    bot_flag: false,
  };

  const url = `${WB_ENDPOINT}/.cloud/database/rest/${encodeURIComponent(LEADS_TABLE)}`;
  const res = await postJson(
    url,
    row,
    { 'x-wb-webapp-access-key': WB_ACCESS_KEY, Prefer: 'return=minimal' },
  );

  if (!res.ok) {
    console.error(
      '[lead] 落库失败：',
      JSON.stringify({ status: res.status, body: res.body }).slice(0, 300),
    );
    return false;
  }
  return true;
}

module.exports = {
  saveToDatabase,
  normalizePhone,
  encryptPhone,
  phoneHash,
  maskPhone,
};
