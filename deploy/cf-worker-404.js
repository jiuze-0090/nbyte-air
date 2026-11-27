/**
 * nbyteair.com 软 404 修复 · Cloudflare Worker
 * ---------------------------------------------------------------------------
 * 白名单白名单路径正常放行，其余路径返回真 404，避免无效 URL 被收录。
 *
 * 维护记录：
 * - 2026-11-27：新增长尾落地页 /weifang-uav-training/ 到 ALLOWED_EXACT。
 *   背景：落地页已部署但被 Worker 拦截返回 404（线上 JS 已是新包，
 *   sitemap 与首页链接已生效，唯独落地页路径被白名单挡住）。
 *
 * 部署方式（重要）：本文件不在 Git 自动部署链路里，必须手动同步到 Cloudflare：
 *   Cloudflare 控制台 → Workers & Pages → 选中负责 nbyteair.com 的 Worker
 *   → 编辑代码 → 全选粘贴本文件 → 部署。
 *   改完立即生效，无需重新构建官网。
 */

const ALLOWED_EXACT = new Set([
  '/',
  '/index.html',
  '/robots.txt',
  '/sitemap.xml',
  '/privacy.html',
  '/favicon.ico',
  '/favicon.svg',
  // 长尾落地页（独立静态 HTML，2026-11-27 新增）
  '/weifang-uav-training/',
  '/weifang-uav-training',
  '/weifang-uav-training/index.html',
]);

// 允许的资源前缀（JS/CSS/图片）
const ALLOWED_PREFIX = ['/assets/', '/images/'];

function isAllowed(pathname) {
  if (ALLOWED_EXACT.has(pathname)) return true;
  return ALLOWED_PREFIX.some((p) => pathname.startsWith(p));
}

const NOT_FOUND_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="robots" content="noindex" />
  <title>页面不存在 | 新字节航空</title>
</head>
<body>
  <h1>404 页面不存在</h1>
  <p>你访问的页面不存在。返回 <a href="https://www.nbyteair.com/">新字节航空官网首页</a>。</p>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 只处理 www / 裸域，避免误伤其它绑定域名
    if (url.hostname !== 'www.nbyteair.com' && url.hostname !== 'nbyteair.com') {
      return fetch(request);
    }

    if (!isAllowed(url.pathname)) {
      return new Response(NOT_FOUND_HTML, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex',
        },
      });
    }

    return fetch(request);
  },
};
