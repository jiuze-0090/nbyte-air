/**
 * 只看企微推送内容，不落库、不打日志
 * 用法：node deploy/scf/lead-handler/preview-push.js
 */
const path = require('path');

process.env.WECOM_WEBHOOK =
  process.env.WECOM_WEBHOOK ||
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=e5598455-74fb-4651-9cf0-b789466844da';
process.env.CORS_ORIGINS = 'https://www.nbyteair.com';

const { main } = require(path.join(__dirname, 'index.js'));

const body = {
  name: process.env.P_NAME || '预览样例',
  phone: process.env.P_PHONE || '13812345678',
  intent: process.env.P_INTENT || '多旋翼视距内执照',
  message: process.env.P_MSG || '',
  source: process.env.P_SRC || '',
  consent: true,
};

(async () => {
  const res = await main({
    httpMethod: 'POST',
    headers: { origin: 'https://www.nbyteair.com' },
    body: JSON.stringify(body),
  });
  console.log('status =', res.statusCode);
  console.log('body   =', res.body);
})();
