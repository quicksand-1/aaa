# 业务工作台前端

基于 Umi/Max 4、Ant Design 6、Pro Components 和内置 Fintech 的通用中后台前端骨架。

## 开发

```bash
npm install
PORT=8001 npm start
```

开发环境会把 `/api` 代理到 `http://127.0.0.1:7001`。

## 生产构建

```bash
npm run build
```

产物输出到 `dist/`。

## 目录

```text
config/routes.ts          # 业务路由与菜单
config/platform.ts        # 平台名称、Logo、代理和登录文案
src/app.tsx               # 初始化、布局和请求拦截
src/access.ts             # 权限码转换
src/pages/welcome         # 框架首页
src/pages/admin           # 账户管理
src/pages/settings        # 个人设置
src/pages/mobile          # 移动端页面
src/layouts/MobileLayout  # H5 App Shell
src/components            # 项目级通用组件
src/constants             # 业务模块与通用校验配置
src/fintech               # 内置组件库，按项目约束保持只读
```

## 移动端 H5

移动端路由位于 `/m`，使用独立 `MobileLayout`，不会套用桌面端 ProLayout：

```text
/m/home
/m/modules
/m/profile
/m/profile/password
/m/scan
```

布局由顶部栏、独立滚动内容区和底部 Tab 组成，并处理 `safe-area-inset-*`。移动端复用浏览器登录会话、`authFunctionList`、统一请求和强制改密能力。

桌面端登录后可通过“手机扫码”生成一次性登录二维码。二维码兑换后建立独立移动会话，不复制桌面端 Cookie。开发环境在 `localhost` 下生成二维码时，会使用后端识别到的局域网 IPv4，手机与电脑处于同一网络即可访问。

新增移动页面时，在 `config/routes.ts` 的 `/m` 子路由中登记，并按需将入口加入 `src/layouts/MobileLayout/index.jsx` 的底部 Tab 配置。

## 页面与路由

页面放在 `src/pages`，路由统一登记在 `config/routes.ts`。绑定模块权限时，在路由上配置 `access: 'yourModule:read'`。

## 请求

业务代码优先使用：

```jsx
import { request } from 'fintech';

request('/api/example', {
  method: 'POST',
  data: values,
  setLoading,
});
```

全局请求错误、登录失效和权限拒绝处理位于 `src/app.tsx`。

## 权限模块

`src/constants/index.ts` 中的 `PERMISSION_MODULES` 初始为空，需要与后端 `app/lib/permissions.ts` 同步维护。登记后，账户管理页会自动生成“阅读 / 修改 / 下载”权限项。

## Fintech

Fintech 组件文档位于 `src/fintech/docs/components/`。使用前先阅读对应文档，不要修改 `src/fintech`。
