# 业务工作台后端

基于 Egg 3 + TypeScript + Knex + SQLite 的通用后端骨架。

## 开发

```bash
cp .env.example .env
npm install
npm run migrate
ADMIN_PASSWORD='Abc123!@#xyz' npm run create-admin -- admin 系统管理员
npm run dev
```

默认地址为 `127.0.0.1:7001`。

## 目录

```text
app/controller/       # HTTP 参数接收与响应
app/service/          # 业务逻辑
app/middleware/       # 鉴权、来源校验、错误处理
app/lib/              # 数据库、密码、权限等基础能力
config/               # Egg 配置
database/migrations/  # 数据库迁移
scripts/              # 管理员创建、备份、构建清理
test/                 # 接口与基础能力测试
```

## 当前接口

| 方法       | 地址                              | 说明          |
| ---------- | --------------------------------- | ------------- |
| GET        | `/api/health`                     | 健康检查      |
| POST       | `/api/login.json`                 | 账号密码登录  |
| GET        | `/api/logout.json`                | 退出          |
| POST       | `/api/miniapp/login.json`         | 微信免密登录  |
| POST       | `/api/miniapp/bind.json`          | 绑定微信身份  |
| GET/DELETE | `/api/miniapp/binding.json`       | 查询/解绑微信 |
| GET        | `/api/system/user/info.json`      | 当前用户      |
| POST       | `/api/system/user/changePwd.json` | 修改密码      |
| GET/POST   | `/api/users`                      | 账户列表/新增 |
| PUT/DELETE | `/api/users/:id`                  | 编辑/删除账户 |
| PUT        | `/api/users/:id/password`         | 重置密码      |
| PUT        | `/api/users/:id/status`           | 启用/停用账户 |

## 权限扩展

`app/lib/permissions.ts` 中的 `PERMISSION_MODULES` 初始为空。新业务需要独立权限时，将模块登记到该数组，并在路由上使用 `requirePermission({ module, action })` 中间件。

管理员始终拥有全部权限；非管理员的可选权限由 `user_permissions` 表保存。前端账户管理页使用同一组模块配置生成权限选项。

## 手机扫码登录

登录用户调用 `/api/mobile/session-ticket.json` 获取一次性票据。票据只保存哈希值，2 分钟有效，同一账号生成新票据后旧票据立即失效。

手机访问 `/m/scan?ticket=...` 时调用 `/api/mobile/login.json` 兑换，成功后创建独立手机会话。票据兑换后立即标记为已使用，防止重复登录。

开发环境从 `localhost` 发起请求时，后端会把主机替换为局域网 IPv4 并保留前端端口。多网卡环境可通过 `MOBILE_QR_BASE_URL` 显式指定扫码访问地址。

## 微信小程序登录

首次账号密码登录后，小程序通过 `Taro.login()` 获取临时 code，后端调用微信 `code2session` 获取 `openid` 并绑定到当前账号。之后登录页可直接用微信身份创建 Bearer 会话。

```dotenv
WECHAT_MINIAPP_APP_ID=当前小程序 AppID
WECHAT_MINIAPP_APP_SECRET=当前小程序 AppSecret
```

当前开发环境凭据属于“深维”产品。开发其他小程序时必须替换为对应小程序凭据，且 AppSecret 只能放在后端环境。

## 数据库

当前迁移创建系统表：

- `users`
- `user_permissions`
- `sessions`
- `mobile_login_tickets`
- `user_identities`

业务表应通过新的 Knex migration 添加，不要直接修改已有迁移文件。

## 验证

```bash
npm run typecheck
npm test
```

测试使用 `storage/test.sqlite`。备份命令为 `npm run backup`。
