'use strict';

/**
 * 腾讯云 Web 函数入口
 * ---------------------------------------------------------------------------
 * Web 函数形态没有「事件对象」，得自己起一个 HTTP server 监听 9000 端口。
 * 这里只做协议转换：HTTP 请求 → 拼成事件对象 → 调 index.js 的 main() → 回响应。
 * 业务逻辑全部在 index.js，两种函数形态共用同一份代码。
 */

const http = require('http');
const { main } = require('./index.js');

const PORT = Number(process.env.PORT || 9000);

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k.toLowerCase()] = Array.isArray(v) ? v.join(',') : v;
  }

  const event = {
    httpMethod: req.method,
    headers,
    body: raw,
    queryString: {},
    path: req.url,
  };

  try {
    const out = await main(event);
    const h = out.headers || {};
    res.writeHead(out.statusCode || 200, h);
    res.end(out.body || '');
  } catch (e) {
    console.error('[lead] 处理异常：', e && e.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'internal error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[lead] Web 函数已启动，监听 ${PORT}`);
});
