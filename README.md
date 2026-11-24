# nbyte-air — 新字节航空官网

官网为「机构门面与成交中枢」，任务是**决策最后一步**，不承担知识内容生产。
（知识内容由配套的「低空原理实验室」`lab.nbyteair.com` 承载。）

## ⚠️ 改内容前必读

**[`docs/内容硬约束.md`](docs/内容硬约束.md)** —— 对外口径红线，动手改任何文案前先读。

三条最容易踩的：

1. **学费 / 学制 / 开班日期禁止编造** —— `src/data.ts` 里是空字符串，页面自动显示「详询招生顾问」
2. **资质口径只能说「无人机驾驶员执照培训与实训基地」** —— 不得自称「培训机构 / 训练机构 / 培训基地」，不得说「考证推荐」；资质编号唯一正确值是 `UAOC-O-HQ-20250507079`（`UAOC` + 字母 `O`）
3. **ICP 备案号留空不显示** —— `src/components/Footer.tsx` 的 `ICP_NUMBER` 保持 `''`

## 技术栈

- React 18 + Vite 5 + TypeScript + Tailwind 3
- **单页 SPA，无路由库**（不要 import react-router-dom）
- Tailwind 色板 `nbyte-50~950` + `accent-orange/cyan`；**无 fontSize/spacing 扩展** → `text-2xs`、`pl-5.5` 这类不生效
- 静态内容真源：`src/data.ts`；SEO 静态正文与 JSON-LD 在 `index.html`

## 开发

```bash
npm install
npm run dev        # 本地开发
npm run typecheck  # 类型检查（TS 严格模式）
npm run build      # 构建 → dist/
npm run lint
```

## 部署

Git 推送 `main` 分支 → Cloudflare Pages 自动部署 → https://www.nbyteair.com

推送前先 `git fetch` 并 rebase——远端可能有自动提交（如 `Updated package-lock.json`）。

```bash
git fetch origin
git rebase origin/main
git push origin main
```

## 留资后端

腾讯云 SCF 函数 `cndmzvtany`，代码在 `deploy/scf/lead-handler/`。
更新已有函数必须传 **4 个文件**（`lead-handler.zip`）。

企微推送用完整手机号（内部招生工作流需要）；函数日志继续脱敏。

---

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-zwqdwzq7)
