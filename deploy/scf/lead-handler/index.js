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
 *   LEAD_COLLECTION CloudBase 集合名，默认 leads
 *
 * 隐私：日志与企微通知里手机号脱敏（138****0090），完整号码只进数据库。
 */

const https = require('https');
const crypto = require('crypto');

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
const COLLECTION = process.env.LEAD_COLLECTION || 'leads';

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

/** 写 CloudBase；SDK 不可用或写入失败时返回 false，不阻断主流程 */
async function saveToDatabase(lead) {
  try {
    const tcb = require('@cloudbase/node-sdk');
    const env =
      process.env.SCF_NAMESPACE ||
      process.env.TCB_ENV ||
      process.env.TENCENTCLOUD_ENVID ||
      process.env.ENV;
    if (!env) return false;
    const app = tcb.init({ env });
    const db = app.database();
    await db.collection(COLLECTION).add({
      ...lead,
      createdAt: new Date().toISOString(),
      source: 'www.nbyteair.com',
    });
    return true;
  } catch (e) {
    console.error('[lead] CloudBase 写入失败：', e && e.message);
    return false;
  }
}

/** 推企业微信群机器人 */
function pushWecom(lead) {
  if (!WECOM_WEBHOOK) return Promise.resolve(false);
  const body = {
    msgtype: 'markdown',
    markdown: {
      content: [
        '**新线索 · 官网课程咨询**',
        `> 称呼：${lead.name}`,
        `> 手机：${lead.phoneMasked}`,
        `> 意向：${lead.intent}`,
        lead.message ? `> 留言：${lead.message}` : '',
        `> 来源：${lead.source}`,
        `> 时间：${lead.time}`,
      ]
        .filter(Boolean)
        .join('\n'),
    },
  };
  const payload = JSON.stringify(body);
  return new Promise((resolve) => {
    const url = new URL(WECOM_WEBHOOK);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      },
      (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode === 200));
      },
    );
    req.on('error', (e) => {
      console.error('[lead] 企微通知失败：', e && e.message);
      resolve(false);
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
  if (!rateLimit(ip)) {
    return json(429, headers, { ok: false, error: 'too many requests' });
  }

  const body = parseBody(event);
  const name = String(body.name || '').trim().slice(0, NAME_MAX);
  const phone = String(body.phone || '').trim();
  const intent = String(body.intent || '').trim().slice(0, 60);
  const message = String(body.message || '').trim().slice(0, MESSAGE_MAX);

  if (!name) return json(400, headers, { ok: false, error: '缺少称呼' });
  if (!PHONE_RE.test(phone)) return json(400, headers, { ok: false, error: '手机号格式不对' });

  const lead = {
    name,
    phone,
    phoneMasked: maskPhone(phone),
    intent: intent || '未填',
    message,
    source: String(body.source || '').slice(0, 200),
    ip,
    time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  };

  const saved = await saveToDatabase(lead);
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
