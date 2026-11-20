# 留资线索接收端 · 腾讯云函数 SCF 部署说明

官网（Cloudflare Pages）提交的咨询表单，由这个函数接收并落地。

```
官网表单 ──POST──▶ SCF 函数 ──┬──▶ CloudBase 数据库（leads 集合，可选）
                              └──▶ 企业微信群机器人（顾问手机立刻收到）
```

代码已打包好：`deploy/scf/lead-handler.zip`（内含 `index.js` + `package.json`，可直接上传）。

---

## 一、准备：企业微信群机器人（约 5 分钟，**先做这个**）

企微是**拿到线索的主要通道**——数据库只是存档。数据库没配也不影响收线索。

1. 电脑上装并登录**企业微信**（注意：不是个人微信，个人微信没有群机器人功能）
2. 左上角「≡」→「群聊」→ 右上角「+」→「发起群聊」→ 拉 2 个同事进来（≥2 人才能建群；也可以只建一个自己的群先测试）
3. 进群 → 右上角「⋯」→「群机器人」→「添加机器人」→ **新建机器人**
4. 名字填 `新字节航空留资`，描述随便写 → 复制它的 **Webhook 地址**
   （形如 `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx`）

> Webhook = 一把万能钥匙，谁拿到都能往群里发消息。**不要发到群里、不要写进前端代码**，只填到函数的环境变量里。

## 二、建云函数

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/) → 顶部搜「**云函数 SCF**」→ 进「函数服务」
2. 顶部选**地域**（建议广州或上海，离学员近）→ 点「**新建**」
3. 按下面填：

   | 项 | 填什么 |
   |---|---|
   | 函数类型 | **HTTP 型**（不是事件型） |
   | 函数名称 | `nbyte-lead-handler` |
   | 地域 | 广州 / 上海 |
   | 运行时 | **Nodejs 18.x** |
   | 实例 | 按需（默认就行） |
   | 上传方式 | **zip 文件上传** → 选 `deploy/scf/lead-handler.zip` |
   | 执行内存 | 256 MB |
   | 超时 | 10 秒 |

4. 点「下一步」→ **环境变量**页，点「添加环境变量」，加三条：

   | 变量名 | 值 |
   |---|---|
   | `CORS_ORIGINS` | `https://www.nbyteair.com`（实验室也要用就补 `,https://lab.nbyteair.com`） |
   | `WECOM_WEBHOOK` | 第一步复制的 Webhook 地址 |
   | `LEAD_COLLECTION` | `leads`（可改，不建数据库就无所谓） |

   > 环境变量的 key/value 只能含字母数字下划线，长度 2–64 字节，不能有中文和特殊符号。

5. 点「完成」创建。

## 三、创建「函数 URL」（这一步容易踩坑）

腾讯云现在主推 **函数 URL**，不是老的 API 网关。

1. 进刚建好的函数 → 左侧导航「**函数 URL**」→「新建函数 URL」
2. 按下面填：

   | 项 | 填什么 | 说明 |
   |---|---|---|
   | 别名/版本 | `$default` | 默认 |
   | 公网/内网访问 | **开启公网访问** | 不开前端调不通 |
   | 授权类型 | **开放** | 选 CAM 鉴权前端会 401 |
   | **CORS** | **不要开 / 留空** | ⚠ 见下 |

   > ⚠ **CORS 一定不要在控制台配**。控制台配了会额外加一份 `Access-Control-Allow-Origin` 头，
   > 和代码里那份重复，浏览器会直接报「CORS 头重复」错误。跨域白名单由代码里的
   > `CORS_ORIGINS` 环境变量统一管，控制台这项留空。

3. 确定后，会生成一个访问地址，形如：
   `https://xxxxxxxx-xxxx.ap-shanghai.scf.tencent.com/api/xxxxxxxx`
   **把这个地址复制下来**（第 5 步要用）。

4. 验证一下（在浏览器地址栏打开会返回 JSON 错误提示属正常）：
   ```
   https://你的函数URL
   ```
   想测 POST，用下面这条（PowerShell）：
   ```powershell
   curl.exe -X POST "你的函数URL" -H "Content-Type: application/json" -d "{\"name\":\"测试\",\"phone\":\"13800138000\",\"intent\":\"测试\"}"
   ```
   返回 `{"ok":true,...}` 且企微群收到消息 = 通了。

## 四、（可选）建 CloudBase 集合存历史线索

1. 腾讯云控制台 → 云开发 CloudBase → 新建环境（和云函数同地域）
2. 「数据库」→ 新建集合 `leads`
3. 函数环境变量加一条 `SCF_NAMESPACE` = 你的环境 ID
4. 重新部署函数（改完环境变量要「函数代码」页点「部署」才生效）

没建 CloudBase 也能跑：函数会自动跳过落库，只发企微通知。

## 五、接到官网上（**两处都要配**）

### 5.1 Cloudflare Pages（生产环境，必须配）

`.env.local` 被 gitignore 了（`.gitignore` 里有 `.env` 和 `*.local`），
而 Cloudflare Pages 是**从 GitHub 仓库构建**的——只配本地文件，线上构建拿不到。

所以要在 Cloudflare 里配：

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → 选你的账号 → **Workers & Pages**
2. 点进 `nbyte-air` 项目 → 左侧「**Settings**」→「**Environment variables**」
3. 「Add variable」：
   - Name: `VITE_LEAD_ENDPOINT`
   - Value: 第 3 步拿到的函数 URL
   - Environment: **Production**（要的话也勾 Preview）
4. 保存。**注意：改环境变量不会自动重新构建**，要点「**Deployments**」→ 最新那次 →「**Retry deployment**」

### 5.2 本地开发（可选）

项目根目录建 `.env.local`：
```
VITE_LEAD_ENDPOINT=https://你的函数URL
```
然后 `npm run dev` 就能直连后端调试。

### 5.3 也可以直接提交（更省事）

因为这个 URL 本来就是公开的（浏览器要直接调它），写进代码不算泄密。
想快速上线，可以把 `src/data.ts` 里改成：
```ts
endpoint: import.meta.env.VITE_LEAD_ENDPOINT || 'https://你的函数URL',
```
缺点是换接口要改代码重新提交。

## 六、验收

打开官网提交一次表单，确认三件事：
1. 页面提示「**已收到，顾问今天内联系你**」（不是「咨询信息已复制」）
2. 企微群收到一条 markdown 消息，含姓名、手机号、意向课程
3. （建了 CloudBase 的话）`leads` 集合多一条记录

## 七、排错

| 现象 | 原因 |
|---|---|
| 浏览器控制台报 CORS 错误 | ① `CORS_ORIGINS` 没写全（要 `https://` + 域名，无路径无尾斜杠）② 控制台的 CORS 又开了，导致头重复 —— 关掉控制台那个 |
| 报 403 / 401 | 函数 URL 授权类型选了 CAM 鉴权，改成「开放」 |
| 提示「已收到」但企微没消息 | `WECOM_WEBHOOK` 配错，或机器人被移出群；去群里确认机器人还在 |
| 提示「已收到」但数据库没记录 | 正常——数据库没配，函数跳过落库只发通知 |
| 提交后一直转圈 | 函数没开公网访问，或超时太短 |
| 线上表单还是「生成咨询信息」 | Cloudflare 环境变量没配，或改完没点 Retry deployment |

## 八、字段与隐私

- 函数日志里手机号已脱敏（`138****0090`），完整号码只写进数据库
- 收集的是手机号 + 称呼 + 意向课程；官网表单下方已加「仅用于课程咨询联系，不对外提供」
  （《个人信息保护法》要求告知用途，**这句不能删**）
- 限流：同一 IP 60 秒内最多 3 次（函数内存级，实例重启会重置，够挡住手抖和简单刷量）
