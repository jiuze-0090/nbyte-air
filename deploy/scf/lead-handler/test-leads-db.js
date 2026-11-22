/**
 * 落库集成自测：验证 leads-db.js 的真实写入行为
 * ---------------------------------------------------------------------------
 * 用法：
 *   node deploy/scf/lead-handler/test-leads-db.js
 *
 * 需要环境变量（从小程序 config/index.js 取）：
 *   WB_ENDPOINT        云库数据面地址
 *   WB_ACCESS_KEY      publishableKey
 *   LEAD_PHONE_SECRET  手机号加密密钥（测试用任意串即可）
 *
 * 跑完会往 leads 表写一条名为「落库自测」的记录，需要手工清理（或用 CLEANUP=1 自动删）。
 */
const path = require('path');

const { normalizePhone, encryptPhone, phoneHash, saveToDatabase } = require(
  path.join(__dirname, 'leads-db.js'),
);

let pass = 0;
let fail = 0;

function check(label, ok, extra) {
  if (ok) {
    pass += 1;
    console.log(`  ✓ ${label}`);
  } else {
    fail += 1;
    console.log(`  ✗ ${label}${extra ? '  → ' + extra : ''}`);
  }
}

(async () => {
  console.log('--- 纯函数自测（不触网）---');

  // 加密相关的断言需要密钥。测试自带一个默认密钥，
  // 这样不依赖外部环境变量也能跑完；「缺密钥」分支随后单独测。
  const savedSecret = process.env.LEAD_PHONE_SECRET;
  if (!savedSecret) process.env.LEAD_PHONE_SECRET = 'test-secret-dedup-20261122';

  check('手机号归一化：去空格', normalizePhone('138 0013 8000') === '13800138000');
  check('手机号归一化：去 +86', normalizePhone('+8613800138000') === '13800138000');
  check('手机号归一化：去横线', normalizePhone('138-0013-8000') === '13800138000');

  const cipher1 = encryptPhone('13800138000');
  const cipher2 = encryptPhone('13800138000');
  check('加密结果非空', !!cipher1);
  check('加密带 GCM 前缀', /^gcm:/.test(cipher1), cipher1.slice(0, 30));
  check('同一号码两次加密结果不同（GCM 随机 IV）', cipher1 !== cipher2);
  check('密文不含明文号码', !cipher1.includes('13800138000'));

  check('哈希稳定（去重用）', phoneHash('13800138000') === phoneHash('13800138000'));
  check('哈希不含明文号码', !phoneHash('13800138000').includes('13800138000'));
  check('不同号码哈希不同', phoneHash('13800138000') !== phoneHash('13800138001'));

  // 密钥缺失时必须留空，不能退化成明文
  delete process.env.LEAD_PHONE_SECRET;
  const noKey = encryptPhone('13800138000');
  check('缺密钥时不落明文（返回空串）', noKey === '', noKey);
  if (savedSecret !== undefined) process.env.LEAD_PHONE_SECRET = savedSecret;
  else process.env.LEAD_PHONE_SECRET = 'test-secret-dedup-20261122';

  if (!process.env.WB_ENDPOINT || !process.env.WB_ACCESS_KEY) {
    console.log('\n--- 落库自测跳过：未配置 WB_ENDPOINT / WB_ACCESS_KEY ---');
    console.log(`\n结果：${pass} 通过 / ${fail} 失败（纯函数部分）`);
    process.exit(fail ? 1 : 0);
  }

  console.log('\n--- 真实落库自测（会写一条测试记录）---');
  const marker = `落库自测-${Date.now()}`;
  const ok = await saveToDatabase({
    name: marker,
    phone: '13800138000',
    intent: '其他咨询',
    message: 'SCF 落库链路自测记录',
    source: 'https://www.nbyteair.com/#contact',
  });
  check('写入返回 true', ok === true);

  if (ok && process.env.CLEANUP === '1') {
    // 用原生 https 直连云库删记录——不引 SDK（官网项目没装 workbuddy-cloud-sdk，
    // 而这个测试要能独立跑在函数包同款环境里）。
    //
    // 注意：匿名角色对 leads 只有 SELECT/INSERT/UPDATE，**没有 DELETE**——
    // 这是有意为之，防止任何人删线索。所以匿名删除必然被拒，
    // 期望结果是 401/42501，说明权限隔离按预期生效。
    const https = require('https');
    const url = new URL(
      `${process.env.WB_ENDPOINT}/.cloud/database/rest/${process.env.LEADS_TABLE || 'leads'}?name=eq.${encodeURIComponent(marker)}`,
    );
    await new Promise((resolve) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'DELETE',
          headers: {
            'x-wb-webapp-access-key': process.env.WB_ACCESS_KEY,
            Prefer: 'return=minimal',
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (c) => {
            raw += c;
          });
          res.on('end', () => {
            const denied = res.statusCode === 401 || res.statusCode === 403;
            check(
              '匿名无删除权（被拒即符合预期）',
              denied,
              `status=${res.statusCode} ${raw.slice(0, 100)}`,
            );
            if (!denied) {
              console.log(`  ⓘ 记录已删除：${marker}`);
            } else {
              console.log('  ⓘ 记录仍在库中，请用管理端清理：' + marker);
            }
            resolve();
          });
        },
      );
      req.on('error', (e) => {
        check('匿名无删除权（被拒即符合预期）', false, String(e && e.message));
        resolve();
      });
      req.end();
    });
  } else if (ok) {
    console.log(`  ⓘ 测试记录「${marker}」已写入，记得手工清理`);
  }

  console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
  process.exit(fail ? 1 : 0);
})();
