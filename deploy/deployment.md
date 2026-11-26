# 部署说明

以下路径以 `/file/business-workbench`、服务名 `business-workbench` 为例，可按实际环境替换。

## 服务器准备

- Node.js 22
- Nginx
- systemd
- 若系统无法使用 `better-sqlite3` 预编译包，准备 Python 3 和 C++ 构建工具链

## 首次部署

1. 上传源码：

```bash
SERVER_HOST=example.com ./deploy/backend-deploy.sh
SERVER_HOST=example.com ./deploy/frontend-deploy.sh
```

2. 在服务器后端目录创建生产环境文件：

```bash
cp /file/business-workbench/backend/.env.example /file/business-workbench/backend/.env
```

至少替换 `APP_KEYS`，并按实际域名配置 `ORIGIN_WHITELIST`。

3. 安装依赖、执行迁移并创建管理员：

```bash
cd /file/business-workbench/backend
npm ci
npm run migrate
ADMIN_PASSWORD='请替换为强密码' npm run create-admin -- admin 系统管理员
```

4. 安装 systemd 和 Nginx 配置：

```bash
cp deploy/systemd/business-workbench.service /etc/systemd/system/
cp deploy/nginx/business-workbench.conf /etc/nginx/conf.d/
systemctl daemon-reload
systemctl enable --now business-workbench
nginx -t && systemctl reload nginx
```

## 日常更新

```bash
SERVER_HOST=example.com ./deploy/backend-deploy.sh
SERVER_HOST=example.com ./deploy/frontend-deploy.sh
ssh example.com 'bash /file/business-workbench/backend-restart.sh'
```

## 数据

SQLite 默认文件为 `backend/storage/dev.sqlite`。生产建议通过 `.env` 的 `DB_FILE` 指向独立数据目录，并配置定时备份：

```bash
cd /file/business-workbench/backend
npm run backup
```

## 上线检查

- `GET /api/health` 返回 200
- 可以登录并完成首次改密
- 管理员可以打开账户管理
- 前端刷新子路由不会 404
- 生产 `.env` 已替换默认 `APP_KEYS`
