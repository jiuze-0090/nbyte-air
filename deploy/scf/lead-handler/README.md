# 留资线索接收端 · 腾讯云函数 SCF 部署说明

官网（Cloudflare Pages）提交的咨询表单，由这个函数接收并落地。

```
官网表单 ──POST──▶ SCF 函数 ──┬──▶ CloudBase 数据库（leads 集合，可选）
                              └──▶ 企业微信群机器人（顾问手机立刻收到）
```

## ✅ 已上线的实例（2026-11-20 实测通过，可直接参照）

| 项 | 值 |
|---|---|
| 函数名 | `nbyte-lead-handler-v2` |
| 地域 / 运行时 / 时区 | 上海 / Nodejs 18.15 / Asia/Shanghai |
| **公网 HTTPS 地址** | `https://1499488717-cndmzvtany.ap-shanghai.tencentscf.com` |
| 上传包 | `lead-handler-console.zip`（**不含** `scf_bootstrap`）—— 完整路径见下方「📦 包在哪」 |
| 启动命令 | 见下方「控制台启动命令推荐写法」 |
| 触发器 | 函数 URL：公网访问开启、授权类型「开放」、**CORS 不启用** |

实测结果：

| 检查 | 结果 |
|---|---|
| GET 函数 URL | `405 {"ok":false,"error":"method not allowed"}` → 函数活着 |
| POST | `200 {"ok":true,"saved":false,"notified":true}` → 企微收到 |
| OPTIONS 预检 | `204`，CORS 头齐全 |
| 官网表单 UI | 填表提交 → 页面显示「已收到，顾问今天内联系你」 |

> ⚠️ **API 网关已于 2025-06-30 停止服务**（控制台「触发管理」页会红字提示）。
> 新函数一律用「**函数 URL**」，不要去建 API 网关触发器。

---

## 一、准备：企业微信群机器人（约 5 分钟，**先做这个**）

企微是**拿到线索的主要通道**——数据库只是存档。数据库没配也不影响收线索。

> ⚠️ **别选错入口**。新版企业微信里有个「**智能机器人**」界面，分「普通模式」和「API 模式」：
> - 普通模式 = 企微自带的 DeepSeek 问答机器人 → ❌ 我们不需要机器人会聊天
> - API 模式 = 企微把消息推给**你的**系统（要填回调 URL + Token + AESKey 加密）→ ❌ 方向反了
>
> 我们要的是**单向推送**（我们的系统 → 企微群），对应的是老的那种「**群机器人**」，
> 新版把它改名叫「**消息推送**」（官方文档写「消息推送（原"群机器人"）」）。
> 它的 webhook 格式是 `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx`，
> 与本函数的代码完全匹配（函数还做了降级：markdown 失败会自动改用 text 格式再试一次）。

1. 电脑上装并登录**企业微信**（注意：不是个人微信，个人微信没有群机器人功能）
2. 左上角「≡」→「群聊」→ 右上角「+」→「发起群聊」→ 拉 2 个同事进来（≥2 人才能建群；也可以只建一个自己的群先测试）
3. 进群 → 右上角「⋯」→「**群机器人**」或「**消息推送**」→「添加机器人」
4. 名字填 `新字节航空留资`，描述随便写 → 复制它的 **Webhook 地址**
   （形如 `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx`）

> Webhook = 一把万能钥匙，谁拿到都能往群里发消息。**不要发到群里、不要写进前端代码**，只填到函数的环境变量里。
>
> 如果机器人配置页里有「**安全密钥**」，把它也填进函数环境变量 `WECOM_SECRET`——
> 函数会自动按官方算法带 timestamp + sign 签名。不填也能用，只是没开安全校验。

## 二、建云函数（Web 函数形态）

> 腾讯云现在主推 **Web 函数**（要填「启动命令」）。若控制台还能选「事件函数」，
> 用事件函数 + HTTP 触发器也行（`exports.main` 入口，不需要启动命令）；
> 本包两种形态都能跑：**事件函数走 `index.js`，Web 函数走 `server.js` + `scf_bootstrap`**。

### 📦 包在哪（绝对路径，别再翻历史记录找）

zip 是**构建产物，不入库**（`.gitignore` 里有 `deploy/scf/*.zip`），所以 clone 下来的仓库里
**找不到 zip 是正常的**，需要本地打包生成。

| 包 | 绝对路径 | 大小 |
|---|---|---|
| ✅ **上传用这个** | `C:\Users\Jiuze\WorkBuddy\官网-新字节航空\nbyte-air-main\deploy\scf\lead-handler-console.zip` | 6158 B |
| 备选 | `C:\Users\Jiuze\WorkBuddy\官网-新字节航空\nbyte-air-main\deploy\scf\lead-handler.zip` | 6958 B |
| 桌面副本（直接拖进控制台） | `C:\Users\Jiuze\Desktop\lead-handler-console.zip` | 6158 B |

本地重新生成：

```bash
cd "C:/Users/Jiuze/WorkBuddy/官网-新字节航空/nbyte-air-main/deploy/scf"
python pack.py                # 生成 lead-handler.zip（含 scf_bootstrap，755）
python pack.py --no-bootstrap  # 生成 lead-handler-console.zip（不含 scf_bootstrap）
```

### ⚠️ 打包必须用 `pack.py`，不能用 Compress-Archive

Windows 的 `Compress-Archive` **不保留 Unix 可执行权限位**。腾讯云把 `scf_bootstrap`
当容器启动命令**直接执行**，没有 +x 就会 `Permission denied` → 函数启动失败 →
网关只返回 502 → 浏览器判定跨域失败，表单永远提交不上去。

| 包 | 内容 | 用途 |
|---|---|---|
| `lead-handler.zip` | 4 个文件，scf_bootstrap=755 | 常规上传 |
| **`lead-handler-console.zip`** | 3 个文件，**无 scf_bootstrap** | ✅ **推荐**：让**控制台的启动命令接管**——由腾讯云生成 scf_bootstrap，权限由它保证，绕开 zip 丢执行位的问题。**已验证可用的就是这个包** |

| 项 | 说明 |
|---|---|
| scf_bootstrap | 权限位 **755**（可执行） |
| index.js / server.js / package.json | 权限位 644 |

### 🔴 502 根因（踩过，务必避开）

腾讯云会把上传的代码放进 `src/` 子目录。如果 `scf_bootstrap` 里写的是相对路径
`exec node server.js`，在 `src/` 里就找不到该文件 → **启动失败 → 网关只返回 502**
→ 502 响应里没有 CORS 头 → 浏览器判定跨域失败 → **POST 根本发不出去**
→ 官网表单表现为「网络有点问题，暂时没提交成功」。

**四种修法，按可靠性排序：**

1. ✅ **上传 `lead-handler-console.zip`（不含 scf_bootstrap）**，让控制台启动命令接管（**已验证**）
2. 用 `pack.py` 打包（写 755 权限位）+ 启动脚本自定位（兼容 `src/` 与根目录）
3. 控制台在线编辑 `src/scf_bootstrap` 的内容（在线保存时腾讯云会重新打包并处理权限）
4. 别删 `src/scf_bootstrap` —— 删掉后控制台会直接报部署失败

### 官方规则：包里有 scf_bootstrap 时，控制台的「启动命令」不生效

> 「控制台配置仅在上传的代码里未检测到 scf_bootstrap 时生效，
> 如果您的项目里有 scf_bootstrap 文件，系统会以项目里的 scf_bootstrap 为准进行部署」

- 包**含** scf_bootstrap → 以包里的为准，控制台输入框忽略 → 依赖 zip 的 755 权限位
- 包**不含** scf_bootstrap → 控制台输入框生效，腾讯云自己生成 scf_bootstrap（权限有保障）✔

**控制台启动命令推荐写法**（兼容代码落在 src/ 或 code/ 的两种布局）：

```bash
#!/bin/bash
export PORT=9000
if [ -f /var/user/src/server.js ]; then cd /var/user/src
elif [ -f /var/user/code/server.js ]; then cd /var/user/code
else cd /var/user; fi
exec /var/lang/node18/bin/node server.js
```

单行版（如果输入框只接受一行）：

```
export PORT=9000; if [ -f /var/user/src/server.js ]; then cd /var/user/src; elif [ -f /var/user/code/server.js ]; then cd /var/user/code; else cd /var/user; fi; exec /var/lang/node18/bin/node server.js
```

### 官方对启动脚本的三条硬要求

1. HTTP 触发的函数**必须监听 9000 端口**
2. 启动命令要用 node **绝对路径** `/var/lang/node18/bin/node`，不能只写 `node`
3. 文件**必须以 LF 结尾**、且**有 755/777 权限**

### ⚠️ 不要在 package.json 里声明依赖

声明了依赖，云端启动阶段可能执行 `npm install`，装不上或网络不通就一直卡着 →
容器起不来 → 502。本包**已移除 `@cloudbase/node-sdk`**，启动零外部依赖。
数据库是可选功能，代码里已优雅降级（找不到模块就跳过落库，只发企微通知）。

### 创建与配置

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/) → 顶部搜「**云函数 SCF**」→ 进「函数服务」
2. 顶部选**地域**（建议广州或上海，离学员近）→ 点「**新建**」
3. 按下面填：

   | 项 | 填什么 |
   |---|---|
   | 函数名称 | `nbyte-lead-handler` |
   | 地域 | 广州 / 上海 |
   | 运行环境 | **Nodejs 18.x** |
   | 时区 | **Asia/Shanghai（北京时间）** |
   | 提交方法 | **通过 zip 上传 zip 包** → 选 `C:\Users\Jiuze\WorkBuddy\官网-新字节航空\nbyte-air-main\deploy\scf\lead-handler-console.zip` |
   | 启动命令 | 见上方推荐写法（包内无 scf_bootstrap，这栏生效） |
   | 资源类型 / 内存 / 超时 | CPU / 256MB / 10 秒 |

4. 点「下一步」→ **环境变量**页，点「添加环境变量」，加三条（**不要加空的**）：

   | 变量名 | 值 |
   |---|---|
   | `CORS_ORIGINS` | `https://www.nbyteair.com`（实验室也要用就补 `,https://lab.nbyteair.com`） |
   | `WECOM_WEBHOOK` | 第一步复制的 Webhook 地址 |
   | `LEAD_COLLECTION` | `leads`（可改，不建数据库就无所谓） |
   | `REQUIRE_CONSENT` | 可选。默认 `true`（未取得告知同意一律拒收）；紧急回滚时才设 `false` |

   > 环境变量的 key/value 只能含字母数字下划线，长度 2–64 字节，不能有中文和特殊符号。
   > 控制台默认自带一条 `TZ=Asia/Shanghai`（对应时区设置），**那一条别动**。
   > `WECOM_SECRET` 只在机器人配了「安全密钥」时才需要；没配就别加这行
   > （控制台的 value **不能留空**，留空就整行删掉）。
   >
   > **关于依赖**：本包已不含任何 npm 依赖。云端若没有数据库 SDK，函数会**自动跳过落库**，
   > 只发企微通知——**不影响收线索**。所以「不建 CloudBase 也能用」是设计好的，不是坑。

5. 点「完成」创建。

## 三、创建「函数 URL」（这一步容易踩坑）

腾讯云现在主推 **函数 URL**，不是老的 API 网关（**API 网关已于 2025-06-30 停止服务**，
控制台「触发管理」页会红字提示，别去建 API 网关触发器）。

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
   `https://1499488717-cndmzvtany.ap-shanghai.tencentscf.com`
   （Web 函数是**无路径**的根地址，不像 API 网关那样带 `/api/xxx`）
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

### ⚠️ 部署顺序（合规改造后必须遵守）

云函数现在**要求提交带 `consent: true`**（未勾选《学员咨询信息处理告知书》的提交一律拒收）。

```
1️⃣ 先部署官网前端（带勾选框 + privacy.html）  ← 必须先
2️⃣ 确认线上 www.nbyteair.com 的表单里已经有勾选框
3️⃣ 再上传新的 lead-handler-console.zip 并部署云函数
```

顺序反了会怎样：旧官网（无勾选框）提交 → 没有 consent 字段 → 云函数返回 400
`consent required` → 用户看到"提交没成功"。**不会丢线索**（用户还能打电话），
但会有一段时间的报错。

**紧急回滚**：在函数环境变量加 `REQUIRE_CONSENT` = `false` 并部署，
即可临时恢复"无同意也接收"，回滚后再去掉这条变量。

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
| **表单一直显示「网络有点问题，暂时没提交成功」** | **502**：函数没起来。① 包里的 `scf_bootstrap` 用相对路径找不到 `server.js`（代码在 `src/` 下）② zip 丢了 755 执行位 ③ `npm install` 卡死 ④ 端口不是 9000。→ 改用 `lead-handler-console.zip` + 控制台启动命令 |
| **提交返回 `consent required`（400）** | 官网前端还没部署带勾选框的版本，或用户没勾选。→ 先部署官网前端；紧急回滚加环境变量 `REQUIRE_CONSENT=false` |
| **提交返回 `invalid request`（400）** | 蜜罐字段 `hp` 非空，被判定为脚本提交并丢弃。真人不该碰到这个——先查前端有没有误把蜜罐渲染成可见输入框 |
| 浏览器控制台报 CORS 错误 | ① `CORS_ORIGINS` 没写全（要 `https://` + 域名，无路径无尾斜杠）② 控制台的 CORS 又开了，导致头重复 —— 关掉控制台那个 |
| 报 403 / 401 | 函数 URL 授权类型选了 CAM 鉴权，改成「开放」 |
| 提示「已收到」但企微没消息 | `WECOM_WEBHOOK` 配错，或机器人被移出群；去群里确认机器人还在 |
| 提示「已收到」但数据库没记录 | 正常——数据库没配，函数跳过落库只发通知 |
| 提交后一直转圈 | 函数没开公网访问，或超时太短 |
| 线上表单还是「生成咨询信息」 | Cloudflare 环境变量没配，或改完没点 Retry deployment；也可能是 `data.ts` 里的兜底地址没更新 |

### 快速自检（不改代码，改完先跑这个）

```bash
cd deploy/scf/lead-handler
node test-local.js
```

覆盖：正常 200 / 缺称呼 400 / 手机号非法 400 / OPTIONS 204 / 越权 Origin 403 / 限流 /
校验失败不计入限流。企微推送也会真的发一条。

## 八、字段与隐私

- 函数日志里手机号已脱敏（`138****0090`），完整号码只写进数据库
- 收集的是手机号 + 称呼 + 意向课程；官网表单下方已加「仅用于课程咨询联系，不对外提供」
  （《个人信息保护法》要求告知用途，**这句不能删**）
- 限流：同一 IP 60 秒内最多 3 次（函数内存级，实例重启会重置，够挡住手抖和简单刷量）
