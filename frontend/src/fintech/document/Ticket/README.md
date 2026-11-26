# Ticket 工单功能配置与使用说明

## 一、功能定位

`Ticket` 不是单独的业务模块，而是一套通用审批容器。

它负责四件事：

- 提供统一的工单管理入口
- 展示“我的申请 / 我的待办 / 历史工单”
- 在审批详情中展示审批节点和审批按钮
- 复用业务编辑页面，同时支持“发起工单”和“审批工单”两种模式

具体业务表单、提交接口、回显逻辑，仍然由业务页面自己实现。

## 二、核心结构

### 1. 入口页面

- 工单管理页：`/system/ticket`
- 代码位置：`src/fintech/frame/system/ticket/index.jsx`

该页面使用 `MagicTabs` 渲染三个标签页：

- 我的申请：`/workOrder/apply.json`
- 我的待办：`/workOrder/my.json`
- 历史工单：`/workOrder/history.json`

### 2. 核心组件

- `TicketBell`
  - 头部待办提醒
  - 代码位置：`src/fintech/src/Ticket/Bell.tsx`
- `TicketDrawer`
  - 工单详情抽屉
  - 内部用 `iframe` 打开对应业务页面
  - 代码位置：`src/fintech/src/Ticket/Drawer.tsx`
- `TicketContainer`
  - 业务页面接入工单能力的核心容器
  - 代码位置：`src/fintech/src/Ticket/Container.tsx`
- `NodeList`
  - 审批流节点展示
  - 代码位置：`src/fintech/src/Ticket/NodeList.tsx`
- `ActionList`
  - 撤销、通过、拒绝等审批动作
  - 代码位置：`src/fintech/src/Ticket/ActionList.tsx`

## 三、必须完成的配置

### 1. 配置系统路由入口

在 `config/routes.ts` 的“系统管理”下配置工单管理入口：

```jsx
{
  path: 'ticket',
  name: '工单管理',
  component: '@/fintech/frame/system/ticket',
  access: 'ticket',
}
```

### 2. 为每个工单业务配置隐藏路由

每个可审批业务都必须额外配置一个隐藏路由，这个路由会被 `TicketDrawer` 的 `iframe` 直接打开。

```jsx
{
  path: 'ENTITY_BINDING',
  name: '子账绑定',
  component: './books/ledger/edit',
  hideInMenu: true,
  headerRender: false,
  footerRender: false,
  menuRender: false,
  hideInBreadcrumb: true,
}
```

要求：

- `path` 必须和后端返回的 `businessType` 一致
- `path` 必须和业务页面使用的 `ticketKey` 对齐
- `component` 必须指向真实的业务编辑页面
- 该页面必须被 `TicketContainer` 包裹

### 3. 配置字典

需要在字典管理中配置：

- 字典 key：`Ticket_Biz_Type`
- 作用：工单列表中展示“工单业务类型”，并作为业务类型筛选项

### 4. 配置权限

工单体系本身至少依赖以下权限码：

- `ticket`：工单管理菜单
- `ticket_apply`：我的申请
- `ticket_todo`：我的待办
- `ticket_history`：历史工单

如果要显示头部红点提醒，还需要：

- `ticket_todo`

业务侧还要保留自己的新增、编辑、发起审批权限。

### 5. 对齐后端接口

前端通用工单能力依赖以下接口：

- `/workOrder/apply.json`
- `/workOrder/my.json`
- `/workOrder/history.json`
- `/workOrder/detail.json`
- `/workOrder/details.json`
- `/workOrder/btn.json`

说明：

- `detail.json`：工单详情数据，给业务页面做表单回显
- `details.json`：审批节点明细，给 `NodeList` 使用
- `btn.json`：当前工单可执行按钮，给 `ActionList` 使用

## 四、业务接入方式

### 1. 在业务列表页增加发起入口

业务列表页一般通过 `LinkBtn` 跳到编辑页，并把当前业务数据写入 `storageSQL`。

示例：

```jsx
<LinkBtn
  to="/books/ledger/edit?bizType=bind"
  onClick={() => {
    storageSQL('duplicate', {
      where: 'key=ENTITY_BINDING',
      values: { key: 'ENTITY_BINDING', bizData: record },
    });
  }}
>
  关联母账
</LinkBtn>
```

这里的关键点：

- `where: 'key=ENTITY_BINDING'` 中的 key 要和 `ticketKey` 一致
- `bizData` 是业务上下文数据
- 页面跳转后，`TicketContainer` 会再把这份数据取出来

### 2. 在业务编辑页使用 `TicketContainer`

业务页必须用 `TicketContainer` 包裹。

示例结构：

```jsx
<TicketContainer
  ticketKey="ENTITY_BINDING"
  confirmLoading={loading}
  okButtonProps={{ hidden: success }}
  callback={(type, params) => {
    // 处理表单模式 / 审批模式
  }}
  onOk={(values) => {
    // 提交业务接口
  }}
>
  <FormSchema items={[...]} />
</TicketContainer>
```

### 3. 在 `callback` 中区分两种场景

`TicketContainer` 会把页面分成两种模式：

- `type === 'form'`
  - 普通业务发起页面
  - 没有 `businessKey`
  - 需要从 `originBizData` 或 URL 参数做初始化
- `type === 'ticket'`
  - 工单审批详情页面
  - 有 `businessKey`
  - 会先调用 `/workOrder/detail.json` 获取工单详情

`callback` 的常用入参：

- `form`：表单实例
- `urlParams`：地址栏参数
- `originBizData`：从 `storageSQL` 带过来的业务数据
- `data`：工单详情里的业务数据
- `snap`：提交工单时附带的自定义上下文

### 4. 在 `onOk` 中提交真实业务接口

`TicketContainer` 不会替业务页面提交接口。
`onOk` 里仍然要调用实际业务保存接口。

推荐模式：

```jsx
onOk={(values) => {
  request('/xxx/save.json', {
    method: 'POST',
    data: {
      ...values,
      snap: JSON.stringify({ bizData }),
    },
    setLoading,
  }).then(() => {
    message.success('提交成功，请前往工单进行查看');
  });
}}
```

说明：

- `snap` 用来存储审批回显时仍然需要的上下文
- 常见写法是 `snap: JSON.stringify({ bizData })`
- 如果业务还有拆分结果、明细映射等信息，也可以一起塞到 `snap`

## 五、运行流程

### 1. 发起工单流程

1. 用户在业务列表页点击“新增 / 编辑 / 发起审批”
2. 页面用 `storageSQL` 先缓存 `bizData`
3. 跳转到业务编辑页
4. 业务编辑页由 `TicketContainer` 进入 `form` 模式
5. `callback('form')` 中根据 `originBizData` 或 URL 参数做表单初始化
6. 用户点击“提交审批”
7. `TicketContainer` 先做表单校验，再弹确认框
8. `onOk` 调用业务保存接口
9. 后端生成工单
10. 用户到 `/system/ticket` 查看结果

### 2. 查看审批详情流程

1. 用户在工单管理列表点击“详情”
2. `TicketDrawer` 把当前行数据写入 `storageSQL`
3. 抽屉打开，并通过 `iframe` 访问 `src={businessType}`
4. 对应业务页面加载
5. `TicketContainer` 读取 `businessKey`
6. 调用 `/workOrder/detail.json`
7. 进入 `ticket` 模式，执行 `callback('ticket')`
8. 业务页面根据 `data` 和 `snap` 进行表单回显
9. 页面顶部展示审批流节点，底部展示审批动作

### 3. 审批动作执行流程

1. `ActionList` 调用 `/workOrder/btn.json` 获取当前可操作按钮
2. 后端返回“撤销 / 通过 / 拒绝”等按钮集合
3. 用户点击按钮
4. 前端弹确认框
5. 调用按钮里对应的 `btnUrl`
6. 成功后刷新按钮区和节点区

## 六、关键约定

这套工单功能对字符串约定非常敏感，下面几项必须保持一致：

- 路由 `path`
- 后端返回的 `businessType`
- 业务页面的 `ticketKey`
- `storageSQL` 中保存的 key
- 字典 `Ticket_Biz_Type` 中的业务类型值

如果这几项不一致，常见现象包括：

- 工单详情打不开
- 打开了错误页面
- 表单回显失败
- `originBizData` 为空
- 工单列表业务类型展示异常

## 七、页面行为说明

### 1. 详情页不是独立组件，而是复用业务编辑页

审批详情并没有单独写一份页面，而是直接复用原业务编辑页。
所以业务编辑页在实现时要天然支持两种状态：

- 可编辑的发起态
- 只读或半只读的审批态

### 2. 工单详情依赖 iframe

`TicketDrawer` 通过 `iframe` 打开 `businessType` 对应的隐藏路由。
为了让 iframe 内页面看起来像“抽屉内容”，`useBald` 会主动隐藏主布局中的：

- 顶部 header
- 左侧菜单
- 面包屑
- 页脚

这意味着：

- 不要把审批页做成依赖外层布局的复杂页面
- 如果后续框架布局类名变化，需要同步检查 `useBald`

## 八、当前项目里已接入的工单业务

当前仓库已接入的业务包括：

- `LEAKAGE_ACCOUNTING`：手工差账
- `RED_OFFSET_ACCOUNTING`：手工红冲
- `BLUE_SUPPLEMENT_ACCOUNTING`：手工蓝补
- `PROVISION_CONFIG`：拨备配置审批路由
- `INIT_PARENT_ENTITY`：创建母账
- `ENTITY_BINDING`：子账绑定
- `RECOGNIZE_RULE`：识别规则
- `RECOGNIZE_SOLUTION`：识别方案

说明：

- 某些页面的 `ticketKey` 和审批路由名并不完全同名
- 这类场景要重点核对后端 `businessType` 返回值，否则最容易出问题

## 九、新增一个工单业务的最小步骤

1. 准备业务编辑页，并确保它能独立作为页面访问
2. 用 `TicketContainer` 包裹该业务页
3. 设计好 `callback('form')` 和 `callback('ticket')` 的初始化逻辑
4. 在 `onOk` 中调用真实业务保存接口，并把必要上下文放入 `snap`
5. 在业务列表页用 `LinkBtn + storageSQL` 增加发起入口
6. 在 `config/routes.ts` 中增加隐藏审批路由
7. 确认 `path / businessType / ticketKey / storage key` 完全一致
8. 确认 `Ticket_Biz_Type` 字典中已经配置该业务类型
9. 联调工单列表、详情回显、审批按钮、节点刷新

## 十、常见问题

### 1. 为什么进入工单详情后页面空白

优先检查：

- 后端返回的 `businessType` 是否存在对应路由
- 隐藏路由是否挂在系统管理下
- 业务页面是否能独立访问

### 2. 为什么审批详情没有回显

优先检查：

- `/workOrder/detail.json` 返回的 `data` 结构
- `callback('ticket')` 是否自己接管了回显
- `snap` 是否把必要上下文带回来

### 3. 为什么工单按钮没有显示

优先检查：

- `/workOrder/btn.json` 是否返回按钮集合
- 当前用户是否处在可审批节点
- 后端是否正确返回 `businessKey` 和 `businessType`

### 4. 为什么业务页初始化数据丢失

优先检查：

- 跳转前是否写入了 `storageSQL`
- `storageSQL` 的 key 是否和 `ticketKey` 一致
- 页面是否依赖刷新后仍保留该缓存

## 十一、建议

- 新接入工单时，先从一个最简单的“新增审批”场景打通，再做“编辑审批”
- 业务页里把“发起态”和“审批态”逻辑明确分开，不要混在一个 if 里持续叠加
- 只把审批回显真正需要的上下文塞进 `snap`，不要无节制堆大对象
- 如果一个业务页面既支持普通保存，又支持工单审批，建议显式区分入口来源
