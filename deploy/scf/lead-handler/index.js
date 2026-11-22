'use strict';

/**
 * 腾讯云函数 SCF · 留资线索接收端
 * ---------------------------------------------------------------------------
 * 官网（Cloudflare Pages）提交咨询表单 → 本函数 →
 *   ① 写 CloudBase 数据库（可失败则降级为仅通知）
 *   ② 推企业微信群机器人，顾问手机立刻收到
 *
 * 环境变量（函数配置里加）：
 *   CORS_ORIGINS   允许访问的站点，逗号分隔。默认只放官网
 *   WECOM_WEBHOOK  企业微信群机器人 Webhook 地址（企微群 → 群机器人 → 复制地址）
 *   WB_ENDPOINT    WorkBuddy 云库数据面地址（落库用，见 leads-db.js）
 *   WB_ACCESS_KEY  云库 publishableKey（落库用）
 *   LEAD_PHONE_SECRET 手机号加密密钥（落库用，必填，否则手机号不落库）
 *   REQUIRE_CONSENT 默认 true：未取得「告知同意」的提交一律拒收。
 *                   紧急回滚时可设 'false' 临时放宽。
 *
 * 请求体：{ name, phone, intent, message, source, consent, hp }
 *   consent  前端勾选《学员咨询信息处理告知书》后传 true
 *   hp       蜜罐字段，真人不可见；非空即判定为脚本提交并丢弃
 *
 * 隐私：日志与企微通知里手机号脱敏（138****0090），完整号码只进数据库；
 *       数据库里手机号也是加密存储（AES-256-GCM），另存哈希用于去重。
 */

const https = require('https');
const crypto = require('crypto');
const { saveToDatabase } = require('./leads-db');

const PHONE_RE = /^1[3-9]\d{9}$/;
const NAME_MAX = 40;
const MESSAGE_MAX = 500;
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 秒
const RATE_LIMIT_MAX = 3; // 同一 IP 每窗口最多 3 次

// 内存限流表：{ ip: timestamp[] }。单实例生效，足够挡住手抖和简单刷量。
const hits = new Map();

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'https://www.nbyteair.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const WECOM_WEBHOOK = process.env.WECOM_WEBHOOK || '';
const WECOM_SECRET = process.env.WECOM_SECRET || ''; // 可选：机器人的安全密钥
// 落库配置在 leads-db.js 里读：WB_ENDPOINT / WB_ACCESS_KEY / WB_ORG_CODE /
// LEADS_TABLE / LEAD_PHONE_SECRET / CONSENT_TEXT_VERSION
// 未取得「告知同意」的提交一律拒收（《个人信息保护法》第十三条）。
// 紧急回滚可设成 'false' 临时放宽，但那只应作为应急手段。
const REQUIRE_CONSENT = process.env.REQUIRE_CONSENT !== 'false';

/** 手机号脱敏 */
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}

/** 取真实客户端 IP（SCF 事件里在 X-Forwarded-For / X-Real-IP） */
function clientIp(event) {
  const headers = event.headers || {};
  const fwd = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return headers['x-real-ip'] || headers['X-Real-IP'] || 'unknown';
}

/** 限流：返回 true 表示允许 */
function rateLimit(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (list.length >= RATE_LIMIT_MAX) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  hits.set(ip, list);
  return true;
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

function json(statusCode, headers, body) {
  return {
    statusCode,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  };
}

/** 解析 event.body（APIGW 传字符串；部分场景是对象） */
function parseBody(event) {
  if (!event.body) return {};
  if (typeof event.body === 'object') return event.body;
  try {
    return JSON.parse(event.body);
  } catch (e) {
    return {};
  }
}

/** 写 WorkBuddy 云数据库；缺配置或写入失败时返回 false，不阻断主流程 */
async function writeLead(lead) {
  return saveToDatabase(lead);
}

/**
 * 推企业微信群机器人（消息推送）
 * ---------------------------------------------------------------------------
 * 兼容两种 webhook：
 *   ① 经典群机器人：https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx
 *      消息体 { msgtype: 'markdown', markdown: { content } }
 *   ② 智能机器人 API 模式的消息推送地址（格式可能不同）
 *      → 先按 ① 发，若返回 errcode 非 0，自动降级用纯 text 格式再试一次
 * 配了安全密钥（WECOM_SECRET）时按官方签名算法带 timestamp + sign。
 */
function pushWecom(lead) {
  if (!WECOM_WEBHOOK) return Promise.resolve(false);

  const content = [
    '**新线索 · 官网课程咨询**',
    `> 称呼：${lead.name}`,
    // 企微群内全是招生顾问，拿到号码才能联系上 → 推完整号码。
    // 脱敏只保留在函数日志里（控制台日志权限宽、会长期留存）。
    `> 手机：${lead.phone}`,
    `> 意向：${lead.intent}`,
    lead.message ? `> 留言：${lead.message}` : '',
    `> 来源：${lead.source}`,
    `> 时间：${lead.time}`,
    lead.consent ? '> 告知同意：已勾选' : '> 告知同意：未勾选（兼容模式）',
  ]
    .filter(Boolean)
    .join('\n');

  // markdown 优先，失败再退到 text
  const payloads = [
    { msgtype: 'markdown', markdown: { content } },
    { msgtype: 'text', text: { content: content.replace(/\*\*/g, '').replace(/^>\s?/gm, '') } },
  ];

  let attempt = 0;

  const send = () => {
    if (attempt >= payloads.length) return Promise.resolve(false);
    const payload = JSON.stringify(payloads[attempt]);
    attempt += 1;

    return postJson(WECOM_WEBHOOK, payload).then((res) => {
      if (res.ok && (!res.body || res.body.errcode === 0 || res.body.errcode === undefined)) {
        return true;
      }
      console.error(
        '[lead] 企微推送失败：',
        JSON.stringify({ status: res.status, body: res.body }).slice(0, 300),
      );
      // 还有别的格式就再试一次
      return send();
    });
  };

  return send();
}

/** POST JSON 到 https 地址，返回 { ok, status, body } */
function postJson(urlString, payload) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (e) {
      resolve({ ok: false, status: 0, body: { errmsg: 'webhook 地址格式不对' } });
      return;
    }

    // 带安全密钥时按官方算法加签名
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (WECOM_SECRET) {
      const timestamp = Math.floor(Date.now() / 1000);
      const sign = crypto
        .createHmac('sha1', WECOM_SECRET)
        .update(`${timestamp}\n${WECOM_SECRET}`)
        .digest('base64');
      url.searchParams.set('timestamp', String(timestamp));
      url.searchParams.set('sign', sign);
    }

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => {
          raw += c;
        });
        res.on('end', () => {
          let body;
          try {
            body = JSON.parse(raw);
          } catch (e) {
            body = { raw: raw.slice(0, 200) };
          }
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body });
        });
      },
    );
    req.on('error', (e) => {
      console.error('[lead] 企微请求异常：', e && e.message);
      resolve({ ok: false, status: 0, body: { errmsg: String(e && e.message) } });
    });
    req.write(payload);
    req.end();
  });
}

exports.main = async (event) => {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const headers = corsHeaders(origin);

  // 预检
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '', isBase64Encoded: false };
  }

  // 来源校验：非白名单直接拒
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json(403, headers, { ok: false, error: 'origin not allowed' });
  }

  if (event.httpMethod !== 'POST') {
    return json(405, headers, { ok: false, error: 'method not allowed' });
  }

  const ip = clientIp(event);

  const body = parseBody(event);
  const name = String(body.name || '').trim().slice(0, NAME_MAX);
  const phone = String(body.phone || '').trim();
  const intent = String(body.intent || '').trim().slice(0, 60);
  const message = String(body.message || '').trim().slice(0, MESSAGE_MAX);
  const hp = String(body.hp || '').trim().slice(0, 100);
  const consent = body.consent === true || body.consent === 'true' || body.consent === '1';

  // 蜜罐：真人看不到、也填不到这个字段；脚本批量提交会填，直接拒收
  if (hp) {
    console.warn('[lead] 蜜罐命中，丢弃', { ip, name: name.slice(0, 12) });
    return json(400, headers, { ok: false, error: 'invalid request' });
  }

  // 告知同意：没有单独同意不收集手机号（《个人信息保护法》第十三条）
  // REQUIRE_CONSENT 设成 'false' 可临时放宽，仅用于紧急回滚
  if (REQUIRE_CONSENT && !consent) {
    console.warn('[lead] 未取得同意，拒收', { ip });
    return json(400, headers, { ok: false, error: 'consent required' });
  }

  // 先校验再限流：用户手滑输错手机号不该被限流，只有「有效提交」才计数
  if (!name) return json(400, headers, { ok: false, error: '缺少称呼' });
  if (!PHONE_RE.test(phone)) return json(400, headers, { ok: false, error: '手机号格式不对' });

  if (!rateLimit(ip)) {
    return json(429, headers, { ok: false, error: 'too many requests' });
  }

  const lead = {
    name,
    phone,
    phoneMasked: maskPhone(phone),
    intent: intent || '未填',
    message,
    // 官网表单必带 source（window.location.href）；为空说明不是从表单来的
    source: String(body.source || '').slice(0, 200) || '（未带来源，非表单提交）',
    consent,
    ip,
    time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  };

  const saved = await writeLead(lead);
  const notified = await pushWecom(lead);

  // 至少通知成功就算收到（数据库失败时顾问仍能看到线索）
  if (!saved && !notified) {
    return json(502, headers, { ok: false, error: '接收端异常，请直接拨打热线' });
  }

  // 留一条不含完整手机号的日志
  console.log('[lead] 收到线索', {
    name: lead.name,
    phone: lead.phoneMasked,
    intent: lead.intent,
    saved,
    notified,
    id: crypto.randomUUID(),
  });

  return json(200, headers, { ok: true, saved, notified });
};
