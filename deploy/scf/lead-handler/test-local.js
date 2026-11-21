/**
 * 本地自测：直接调用云函数入口，验证校验、告知同意、蜜罐、企微推送、响应格式
 * 用法：node deploy/scf/lead-handler/test-local.js
 */
const path = require('path');

const WEBHOOK =
  process.env.WECOM_WEBHOOK ||
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=e5598455-74fb-4651-9cf0-b789466844da';

process.env.WECOM_WEBHOOK = WEBHOOK;
process.env.CORS_ORIGINS = 'https://www.nbyteair.com';

const { main } = require(path.join(__dirname, 'index.js'));

function evt(body, headers = {}, httpMethod = 'POST') {
  return {
    httpMethod,
    headers: { origin: 'https://www.nbyteair.com', ...headers },
    body: JSON.stringify(body),
  };
}

// 合规提交：带 consent
const ok = { name: '测试学员', phone: '13800138000', intent: '多旋翼视距内执照', message: '本地自测', consent: true };

(async () => {
  const cases = [
    ['① 正常提交（已勾选同意）', evt(ok)],
    ['② 未取得同意 → 应拒', evt({ name: '张三', phone: '13800138000' })],
    ['③ 蜜罐命中 → 应拒', evt({ ...ok, name: '机器人', hp: 'http://spam.example' })],
    ['④ 蜜罐 + 无同意 → 蜜罐优先', evt({ name: '机器人2', phone: '13800138000', hp: 'x' })],
    ['⑤ 缺称呼', evt({ ...ok, name: '' })],
    ['⑥ 手机号非法', evt({ ...ok, phone: '12345' })],
    ['⑦ OPTIONS 预检', evt({}, {}, 'OPTIONS')],
    ['⑧ 非白名单来源', evt(ok, { origin: 'https://evil.com' })],
  ];

  for (const [label, e] of cases) {
    const res = await main(e);
    console.log(
      `${label}  →  status=${res.statusCode}  body=${(res.body || '').slice(0, 160)}`,
    );
  }

  // 限流验证：同 IP 连续 5 次有效提交，第 4 次起应被拒
  console.log('\n--- 限流验证（同 IP 连发 5 次有效提交）---');
  for (let i = 1; i <= 5; i++) {
    const res = await main(evt({ ...ok, name: '限流' }));
    console.log(`  第 ${i} 次 → status=${res.statusCode}`);
  }

  // 校验失败不应消耗限流配额
  console.log('\n--- 校验失败不计入限流 ---');
  for (let i = 1; i <= 3; i++) {
    const res = await main(evt({ ...ok, name: '' }));
    console.log(`  第 ${i} 次空称呼 → status=${res.statusCode}（应为 400，不是 429）`);
  }

  // 未取得同意不应消耗限流配额
  console.log('\n--- 未取得同意不计入限流 ---');
  for (let i = 1; i <= 3; i++) {
    const res = await main(evt({ name: '无同意', phone: '13800138000' }));
    console.log(`  第 ${i} 次无同意 → status=${res.statusCode}（应为 400 consent required，不是 429）`);
  }
})();
