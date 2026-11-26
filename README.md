# 业务工作台框架

前后端分离的通用业务工作台骨架，用于快速开始新的业务系统开发。

- **后端**：Node.js 22 + Egg 3 + TypeScript + Knex + SQLite
- **前端**：Umi/Max 4 + Ant Design 6 + @ant-design/pro-components + Fintech
- **小程序**：Taro 4.3 + React + TypeScript（微信小程序）

## 已保留的能力

- 登录、退出、会话与首次登录强制改密
- 桌面端生成一次性二维码，手机扫码后建立独立移动会话
- 管理员、编辑员、查看员和自定义角色
- 账户管理与模块权限扩展点
- 统一请求、全局错误处理和路由权限过滤
- 桌面端后台布局、移动端 H5 App Shell、个人设置与 404 页面
- 微信小程序登录、首页、业务模块、个人中心与修改密码页面
- SQLite 迁移、备份脚本、自动化测试和部署脚本
- 内置 `frontend/src/fintech` 业务组件库

当前不包含任何业务台账、业务数据表、导入模板或示例记录。数据库初始化后只有 `users`、`user_permissions` 和 `sessions` 三张系统表。

## 目录结构

```text
backend/          # Egg 后端
frontend/         # Umi/Max 前端
miniapp/          # Taro 微信小程序
deploy/           # Nginx、systemd 和部署脚本
docs/             # 通用开发文档
dev.sh            # 后端、Web 前端和小程序一键启动
```

## 环境要求

- Node.js 22
- npm 10+
- macOS/Windows 若 `better-sqlite3` 没有预编译包，还需要 Python 3 和 C/C++ 工具链

## 本地启动

### 1. 初始化后端

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
ADMIN_PASSWORD='Abc123!@#xyz' npm run create-admin -- admin 系统管理员
npm run dev
```

后端默认监听 `http://127.0.0.1:7001`，健康检查：

```bash
curl http://127.0.0.1:7001/api/health
# {"success":true,"data":{"status":"ok"}}
```

### 2. 启动前端

```bash
cd frontend
npm install
PORT=8001 npm start
```

浏览器访问 `http://localhost:8001`，使用刚创建的 `admin` 登录。首次登录必须修改密码。

### 3. 一键启动

在仓库根目录执行：

```bash
./dev.sh
```

脚本会先让你选择要启动的应用，支持多选。选中的应用如果尚未安装依赖，脚本会先执行 `npm install`，然后再启动。小程序启动后在微信开发者工具中打开 `miniapp` 目录即可预览，Ctrl+C 会同时停止已启动的进程。

## 移动端 H5

前端内置独立的移动端路由树，访问 `/m` 即可进入 App 形态页面：顶部栏、独立滚动内容区和底部 Tab 导航。移动端与桌面端共用登录、会话、请求和权限体系。

默认入口：

```text
/m/home      # 首页
/m/modules   # 业务模块
/m/profile   # 个人中心
/m/scan      # 二维码兑换入口
```

桌面端登录后可点击“手机扫码”生成二维码。二维码 2 分钟有效、只能兑换一次。开发环境从 `localhost` 打开时，会自动将二维码地址替换为当前局域网 IPv4（例如 `http://192.168.1.33:8001`），手机与电脑连接同一 Wi-Fi 后即可扫码。

如自动识别的网卡不正确，可在 `backend/.env` 中设置：

```bash
MOBILE_QR_BASE_URL=http://192.168.1.33:8001
```

## 小程序

`miniapp/` 是基于 Taro、React 和 TypeScript 的小程序工程，当前已支持微信小程序，已实现登录、首页、业务模块、个人中心和修改密码页面，并复用现有后端登录、会话与权限接口。

小程序登录优先使用微信身份免密进入。首次使用仍需输入工作台账号和密码，登录成功后自动绑定当前微信；之后再次进入登录页会先调用 `Taro.login()` 检查绑定关系。“我的”页面支持查询绑定状态和微信解绑。

微信小程序服务端配置位于 `backend/.env`：

```bash
WECHAT_MINIAPP_APP_ID=当前小程序 AppID
WECHAT_MINIAPP_APP_SECRET=当前小程序 AppSecret
```

当前开发环境的 AppSecret 属于“深维”产品。开发其他小程序时必须同时替换 AppID 和 AppSecret，禁止跨产品复用。

### 开发者工具

| 平台 | 工具下载 |
| --- | --- |
| 微信 | [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) |
| 钉钉 | [钉钉小程序开发者工具](https://open.dingtalk.com/document/download/miniapp-tool) |
|飞书| [飞书小程序开发者工具](https://open.feishu.cn/document/tools-and-resources/development-tools/overview-of-ide?lang=zh-CN) |

多平台构建和环境配置方案见 [小程序多平台配置方案](docs/小程序多平台配置方案.md)。

首次使用：

```bash
cd miniapp
npm install
npm run dev:weapp
```

然后在微信开发者工具中导入 `miniapp` 目录，开发版会读取 `miniapp/dist`。本地开发时需在开发者工具中勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”，或为后端配置合法的 HTTPS request 域名。

开发环境接口地址位于 `miniapp/.env.development`：

```bash
TARO_APP_API_BASE=http://127.0.0.1:7001/api
```

真机调试时 `127.0.0.1` 指向手机自身，需要改成电脑局域网 IP；生产环境需在 `miniapp/.env.production` 配置实际的 HTTPS API 地址。小程序端使用 Bearer 会话令牌，桌面端和 H5 继续使用原有 Cookie 会话。

小程序内置从 chat 场景移植的 X 系列公共组件：`XMessages`、`XSender`、`XThinking` 和 `XWorkspace`，统一从 `miniapp/src/components/x` 导入。登录后可从首页“对话组件”进入预览页，详细 API 见 `miniapp/src/components/x/README.md`。

生产构建与类型检查：

```bash
cd miniapp
npm run typecheck
npm run build:weapp
```

## 新增业务模块

1. 在 `frontend/src/pages` 下创建页面。
2. 在 `frontend/config/routes.ts` 登记路由和菜单。
3. 在 `backend/app/controller`、`backend/app/service` 中添加接口逻辑，并在 `backend/app/router.ts` 注册路由。
4. 在 `backend/database/migrations` 中添加数据库迁移。
5. 需要独立权限时，同时在前后端的 `PERMISSION_MODULES` 中登记模块。
6. 为新增接口和核心逻辑补充测试。

详细说明见 [docs/development.md](docs/development.md)。

## 验证

```bash
cd backend
npm run typecheck
npm test

cd ../frontend
npm run build

cd ../miniapp
npm run typecheck
npm run build:weapp
```

部署说明见 [deploy/deployment.md](deploy/deployment.md)。
