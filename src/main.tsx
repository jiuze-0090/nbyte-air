import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// SEO/GEO：React 成功挂载后给 html 打标记。
// index.html 的 #root 内预置了静态兜底正文（供不执行 JS 的爬虫读取），
// createRoot().render() 会清空并替换它；这里再加一层 .js-ready 作为双保险。
document.documentElement.classList.add('js-ready');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
