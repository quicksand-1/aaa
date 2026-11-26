# Fintech

基于 `antd` 生态封装的前端组件与工具库，目标是减少业务项目中的样板代码，统一常见交互模式，并沉淀一批更适合中后台场景的高频能力。

项目当前同时包含：

- 业务友好的二次封装组件
- 常用工具函数与 hooks
- 基于 `dumi` 的组件文档站点
- 基于 `father` 的类库构建配置

## 特点

- 基于 `antd`、`@ant-design/pro-components`、`@ant-design/plots`
- 优先提供更贴近业务的声明式 API
- 封装常见异步请求、字典映射、状态展示、表单渲染逻辑
- 同时导出组件、工具方法、hooks、class 能力
- 文档与源码同仓维护，适合持续演进

## 接入方式

本仓库不以 npm 包形式发布，业务项目通常通过 `git submodule` 的方式接入源码。

接入后，一般由宿主项目自行处理构建、别名映射和静态资源拷贝。核心依赖包括：

- `react` / `react-dom`
- `antd`
- `@ant-design/icons`
- `@ant-design/pro-components`
- `@ant-design/plots`
- `@umijs/max`
- `antd-style`
- `dayjs`

部分组件还会依赖：

- `react-dnd` / `react-dnd-html5-backend`
- `immutability-helper`
- `page-agent`
- `sm-crypto`

如果宿主项目直接消费源码，还需要保证 TypeScript、样式方案和文档中提到的静态资源路径与当前仓库约定保持一致。

## 快速开始

```tsx
import React from 'react';
import { Form, FormItem, SelectList, StatusTag } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={(values) => console.log(values)}>
      <FormItem
        name="country"
        label="国家"
        valueType="select"
        inputProps={{
          options: { CHINA: '中国', USA: '美国' },
        }}
      />
      <FormItem name="remark" label="备注" valueType="textarea" />
      <SelectList options={{ YES: '是', NO: '否' }} style={{ width: 240 }} />
      <StatusTag
        value="success"
        valueEnum={{ success: { text: '成功', color: 'green' } }}
      />
    </Form>
  );
};
```

## 主要能力

### 表单与数据录入

- `FormItem` / `FormSchema` / `FormUpdate`
- `SelectList` / `CheckList` / `RadioList`
- `DateQuick`
- `AsyncTree`

适合把输入控件、字典枚举、日期处理、联动逻辑收敛到统一入口。

### 展示与容器

- `DescList`
- `DrawerBox`
- `CollapseList`
- `MagicTabs`
- `SplitterBox`
- `Iframe`
- `Observer`
- `ActionsContainer`
- `More`

适合减少中后台页面在布局、容器、展示组件上的重复代码。

### 异步与业务增强组件

- `AsyncSwitch`
- `AutoRefresh`
- `ProTableAsync`
- `LinkBtn`
- `TicketBell` / `TicketContainer` / `TicketDrawer`

重点覆盖异步状态切换、自动刷新、列表查询、增强按钮、工单类场景。

### 图表组件

- `BasePro`
- `BarPro`
- `LinePro`
- `ColumnPro`
- `ChartFilterDrawer`

对 `@ant-design/plots` 做了一层更偏业务配置的封装。

### 工具与辅助能力

- `request` / `cacheRequest`
- `clipboard`
- `fullScreen`
- `storageSQL`
- `parseNestedJSON`
- `toThousands`
- `desensitize`
- `getUrlParams`
- `useDebounce` / `useDate` / `useKeyboard`
- `GlobalScheduler` / `Resizable`

## 特殊资源说明

以下组件不是纯 React 依赖，还会用到 `public/assets` 下的静态资源：

- `CodeMirror`
- `Excel2Json`
- `Highlight`
- `Html2Image`

其中 `ProTableAsync` 的导出能力依赖 `xlsx.js`。如果你的宿主项目没有这些静态资源，需要一并补齐对应文件。

## 文档与开发

启动文档站：

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run dev
npm run build
npm run docs:build
npm run format
npm run lint
```

说明：

- `dumi` 用于文档站点与示例预览
- `father` 用于类库构建
- 文档首页在 [docs/index.md](./docs/index.md)
- 组件导出入口在 [src/index.ts](./src/index.ts)

## 目录结构

```text
.
├── docs/                # dumi 文档
├── document/            # 部分补充说明文档
├── frame/               # 示例/框架页面资源
├── public/              # 文档站静态资源与组件依赖资源
├── src/                 # 组件、hooks、utils、class 源码
│   ├── Charts/
│   ├── hooks/
│   ├── fetch/
│   ├── class/
│   └── utils/
├── .dumirc.ts           # dumi 配置
└── package.json
```

## 适用场景

这个库更适合：

- 基于 `antd` 的中后台项目
- 需要快速搭建查询页、表单页、详情页、图表页的团队
- 希望统一常见业务交互与数据格式的项目

如果你只需要极轻量的原子组件，或者希望完全贴近原生 `antd` API，这个库未必是最合适的选择。

## License

[MIT](./LICENSE)
