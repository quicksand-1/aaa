# 工作原则

1. 从真实目标和约束出发，不默认用户已经选对了解法。目标或关键动机不清楚，并且不同理解会显著改变结果时，先讨论；目标清楚时直接推进。
2. 修改前先检查项目现状、已有实现和依赖能力。优先沿用已经验证的模式，不凭印象假设组件、接口或工具不存在。
3. 选择满足当前需求的最简单长期方案。避免临时方案、预防性抽象和没有真实调用方的兼容层。
4. 控制修改范围，保留用户已有改动，不顺手重构无关代码。
5. 规范冲突时按以下优先级处理：禁止事项和安全边界 > 项目约定 > 推荐实践 > 示例代码。

# 禁止事项

1. 禁止修改 `src/fintech` 目录下的任何文件。
2. 禁止私自提交、推送代码或创建 Pull Request。
3. 禁止引入 Redux、MobX、Zustand、Recoil 等新的全局状态库。
4. 禁止使用动态导入规避正常依赖，例如 `await import('@/utils/request')`。
5. 未确认现有依赖无法满足需求前，禁止新增第三方包。

# 项目结构约定

## 文件类型

- 在 `src/components/**` 和 `src/pages/**` 中新建文件时使用 `.jsx` 或 `.js`，不要新建 `.tsx` 或 `.ts`。
- 修改已有文件时沿用其文件类型，不为统一后缀进行无关迁移。
- 页面中的独立功能应拆分到同目录组件，例如：

```text
src/pages/reportConfig/
├── index.jsx
└── EditDrawer.jsx
```

以下情况通常需要拆分：

- 新增或编辑抽屉。
- 详情查看、筛选器、批量操作等具有独立职责的功能。
- 主文件因新增功能而明显难以阅读。

不要仅为了减少文件行数拆分缺少独立职责的小片段。

## 路由

在 `config/routes.ts` 中新增路由时：

- `path` 使用首字母小写的驼峰命名，例如 `/assetManagement`、`/projectDetail`。
- `component` 必须与 `src/pages` 下的真实路径和大小写一致。
- 子路由保持现有相对路径风格，不顺便修改已有 URL。

## 样式

- `src/components` 和 `src/pages` 中优先使用 TailwindCSS。
- 编写样式前先查看 `tailwind.config.js`，复用已有颜色、字体、圆角等设计令牌。
- TailwindCSS 难以清晰表达复杂交互、第三方组件覆盖或复用样式时，可以沿用项目已有样式方案；不要为了“纯 Tailwind”制造难以维护的类名。
- 项目现有入口为 `tailwind.css`，配置文件为 `tailwind.config.js` 和 `postcss.config.js`。
- 页面默认不使用 `PageContainer`；需要视觉容器时按实际语义选择 `Card` 或普通布局容器。

# fintech 使用规范

## 选择原则

使用 antd、pro-components 或 `@ant-design/x` 前，先判断 fintech 是否提供了语义和能力匹配的封装。匹配时优先使用 fintech；不匹配时允许使用原生组件，不做机械替换。

| 场景 | 优先组件 | 原生组件仍适用的情况 |
| --- | --- | --- |
| 标准抽屉、抽屉表单 | `DrawerBox` | 确认、警告等轻量对话使用 `Modal` |
| 链接式操作、带权限或确认的操作按钮 | `LinkBtn` | 提交按钮或 `LinkBtn` 无法表达的特殊按钮 |
| 数据列表 | `ProTableAsync` | 非表格布局或封装能力不匹配 |
| 字典、异步下拉 | `SelectList` | 高度定制的选择交互 |
| 配置式描述列表 | `DescList` | 简单或特殊布局的描述内容 |
| 标准标签页 | `MagicTabs` | 封装能力不匹配的复杂标签页 |
| Schema 驱动表单字段 | `FormSchema` | 必须直接控制 `Form.Item` 的特殊场景 |
| 动态表单列表 | `EditTable` | 非表格形态的复杂动态结构 |
| Markdown 内容 | `Xmarkdown` | 普通标签、按钮文案和纯 JSX 文本 |

常规组件和工具从主入口导入：

```jsx
import { DrawerBox, FormSchema, LinkBtn, request } from 'fintech';
```

X 系列能力从独立入口导入：

```jsx
import { Xmarkdown, Xmessages, Xsender } from 'fintech/x';
```

## 使用前检查

- 首次使用某个 fintech 组件、对 API 不确定或现有代码行为异常时，必须先阅读 `src/fintech/docs/components/组件名.md`。
- 文档无法解释行为、需要确认默认值或回调参数时，再阅读对应源码 `src/fintech/src/组件名/`。
- 优先参考仓库内当前使用方式，不复制与现版本不一致的历史示例。
- 只读文档和源码用于理解，仍不得修改 `src/fintech`。

## request

- 页面、组件和业务 service 中使用 `import { request } from 'fintech'`，不要新增从 `@/utils/request` 导入的业务代码。
- `src/app.tsx`、框架初始化及已有底层封装属于基础设施，除非任务明确要求，不为了统一导入路径修改它们。
- 单次请求或简单提交优先使用 `.then()`；存在清晰的串行流程时可以使用 `async/await`，不要为了风格强行改写。
- 传入 `setLoading` 后由 request 管理加载状态，不要在请求前后重复手动切换同一个 loading。
- 全局错误处理位于 `src/app.tsx`。不要仅为重复弹出通用错误而添加 `.catch()`；需要业务降级、回滚、清理、重试或忽略预期错误时，应进行局部错误处理。
- 仅在当前页面使用的请求可以就近调用；被多个页面或组件复用时放入 `src/services`。

```jsx
request('/api/data', {
  method: 'POST',
  data: values,
  setLoading,
}).then(() => {
  message.success('操作成功');
  actionRef.current?.reload();
});
```

# 组件实践

## LinkBtn

条件展示优先使用 `open` 属性，避免在外层包裹整个组件：

```jsx
<LinkBtn open={!record.enabled}>启用</LinkBtn>
```

## DrawerBox

- 新增或编辑表单抽屉应拆成独立的 `EditDrawer.jsx` 或 `FormDrawer.jsx`。
- 使用 `actionRef`，不要使用已经废弃的 `ref`。
- 设置 `form` 后 DrawerBox 会自动包裹 Form，不要再手动创建或嵌套 Form。
- 通过 `drawerRef.current?.form` 访问表单实例。
- `onOk` 可接收 `{ values, open, form }`；成功后使用 `open(false)` 关闭。
- 数据回显放在 `afterOpen`，新增场景应确保表单被重置。
- DrawerBox 默认在关闭时重置表单；只有确有需要时才手动重置。
- 请求 loading 传给 `confirmLoading`。
- 当抽屉组件接收触发元素 `children` 时，可以使用正确的 cloneElement 形式注入打开事件：

```jsx
const trigger = cloneElement(children, {
  onClick: () => drawerRef.current?.open(true),
});
```

若需要保留原触发元素的 `onClick`，应显式组合两个回调，不能静默覆盖。

推荐参考：`src/fintech/frame/system/userManage/EditDrawer.jsx`。

## FormSchema

`items` 应放在最容易理解且不会造成无意义重建的位置：

- 简短静态配置：可以直接内联。
- 较长但静态的配置：定义为组件内常量，保持与使用位置接近。
- 依赖 props、状态或权限的配置：在组件内计算；只有确有渲染稳定性需求时使用 `useMemo`。
- 不要为了满足固定写法，把大型 Schema 全部塞进 JSX 或无条件提升到模块顶层。

# 状态管理

- 跨组件或跨路由共享状态统一使用 `@umijs/max` 的 `useModel`。
- 组件内部状态使用 `useState`；父子组件优先使用 props；可就近管理的数据不要放入全局状态。
- 项目级通用状态优先放在 `src/models/global.js`。
- 只有当某个业务域存在稳定的跨组件共享状态，且继续放入 `global.js` 会明显破坏内聚性时，才考虑新增领域 model；不要按页面机械创建 model。
- 新增 model 仍必须通过 `useModel` 使用，不得引入其他状态管理方案。

# 代码设计与交付

1. 清理已确认不再使用的旧逻辑，不为不存在的调用方保留兼容代码。确有历史数据或外部调用方时，再设计 migration、fallback 或兼容层。
2. 组件保持单一职责，但不要预防性拆分只有一个使用点、没有独立行为的小组件。
3. 优先复用项目已有依赖和成熟产品中已验证的交互模式。
4. 注释解释“为什么”，不要复述代码已经表达的“做了什么”。
5. 修改后检查变更范围，并按风险执行相关测试、lint 或构建。无法执行时说明原因和未验证部分。
6. 可由 ESLint、测试或 CI 稳定检查的约束，应优先落实为自动化规则；AGENTS.md 主要记录决策边界和项目特有约定。
