# Secret API Token 管理页面

## 归属与接入

- 正式实现位于 `frame/system/secret/`，由 fintech 仓库维护。
- 宿主项目通过 `import SecretPage from 'frame/system/secret'` 消费，不得在宿主页面目录复制实现。
- 页面入口权限为 `apitoken_mgr`；管理请求继续使用宿主项目的登录 Session。

## general-system 契约

| 动作           | 接口                                    | 权限                   |
| -------------- | --------------------------------------- | ---------------------- |
| 创建           | `POST /system/apitoken/create.json`     | `apitoken_create`      |
| 列表与明文回看 | `GET /system/apitoken/list.json`        | `apitoken_list`        |
| 编辑           | `POST /system/apitoken/edit.json`       | `apitoken_edit`        |
| 删除           | `POST /system/apitoken/delete.json`     | `apitoken_delete`      |
| 启停           | `POST /system/apitoken/status.json`     | `apitoken_status`      |
| 调用日志       | `GET /system/apitoken/access-logs.json` | `apitoken_access_logs` |

`detail.json`、`enable.json`、`disable.json` 及其旧权限编码不属于正式契约。

## 页面行为

1. 创建抽屉只展示秘钥名称，并且请求只提交 `tokenName`。
2. 列表记录直接包含当前用户可回看的 `accessToken`，查看操作不再发起详情请求。
3. 编辑抽屉维护名称、可选过期时间和可选 endpoint scope，不轮换 Token。
4. `status.json` 使用 form 参数 `tokenId/status`，状态值为 `1`（启用）或 `2`（停用）。
5. 只有停用 Token 展示删除入口；`delete.json` 使用 form 参数 `tokenId`。
6. 调用日志按 Token 查询；Token 明文和 Authorization 不得写入日志、URL 或编辑表单状态。

## 验证

```bash
npm test
npm run build
```

宿主项目还必须执行生产构建和浏览器 E2E，至少覆盖创建、列表回看、编辑、启停、删除、调用日志及按钮权限。
