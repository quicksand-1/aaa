---
group: 场景
title: Ticket
order: 1
---

# Ticket

工单组件，与后端高度集成化，需要配合我们自己的 [pro](http://gitlab.abssqr.cn/web/pro) 框架来进行使用

## 配置

### 框架路由设置

- 文件路径：/config/routes.ts
- 配置规则：
  ```
  {
    // 承载工单详情页面的路由
    path: '/ticket',
    layout: false,
    routes: [
      {
        path: 'LEAKAGE_ACCOUNTING',          // 工单枚举 businessType
        name: '手工差账',                     // 工单枚举 name
        component: './books/manual/leakage', // 提交工单的具体业务编辑页面，必须是独立页面，且被 TicketContainer 组件包裹
      },
    ]
  }
  ```

### 工单枚举设置

- 在 “字典管理” 中设置 `Ticket_Biz_Type/工单业务类型` 的字典

## 组件

### TicketBell

待办工单的小红点提示，所属权限码 `ticket_todo`，已经集成到框架的 `/src/components/RightContent`

### TicketDrawer

工单详情组件，内部使用 iframe 实现需要查看的工单内容，也就是提交工单的编辑页面，已经集成到框架的 `/src/pages/system/ticket`

### TicketStatusEnum

工单详情枚举，已经集成到框架的 `/src/pages/system/ticket`

```
{
  已过时: { text: '已过时', status: 'Default' },     // OUTOFDATE
  未提交: { text: '未提交', status: 'Default' },     // UNSUBMIT
  审批中: { text: '审批中', status: 'Processing' },  // PENDING
  已通过: { text: '已通过', status: 'Success' },     // PASSED
  无审批: { text: '无审批', status: 'Success' },     // UNWANTED
  已拒绝: { text: '已拒绝', status: 'Error' },       // FAILED
  未通过: { text: '未通过', status: 'Error' },       // FAILED
  已撤销: { text: '已撤销', status: 'Default' },     // CANCEL
}
```

### TicketContainer

工单编辑组件，需要提交工单的编辑页面需要被该组件包裹。组件内部集成了 Form，所以被包裹的组件可以直接使用 FormSchema 等

| 参数           | 说明                                                       | 类型                                                               | 默认值   |
| :------------- | :--------------------------------------------------------- | :----------------------------------------------------------------- | :------- |
| onOk           | 提交按钮事件                                               | `function(formValues)`                                             |          |
| okText         | 提交按钮文案                                               | string                                                             | 提交审批 |
| okButtonProps  | 提交按钮属性                                               | [Button](https://ant-design.antgroup.com/components/button-cn#api) |          |
| actions        | 头部右侧操作区按钮                                         | ReactNode[ ]                                                       | ['ok']   |
| confirmLoading | 提交按钮的 loading 效果                                    | boolean                                                            | false    |
| ticketKey      | 工单枚举的 businessType，必须设置                          | string                                                             |          |
| callback       | 页面渲染时的回调函数，提交工单和工单详情时会返回不同的参数 | `function(type, params)`                                           |          |

#### callback(type, params)

工单详情场景下，组件内部会自动进行表单回显工作，如果你不希望这样，那么可以在函数中返回 true 来阻断该事件

| 出参   | 参数          | 说明                                   | 所属场景     |
| :----- | :------------ | :------------------------------------- | :----------- |
| type   |               | 事件类型，当前渲染的是编辑还是工单场景 |              |
|        | form          | 提交工单的渲染场景                     |              |
|        | ticket        | 工单详情的渲染场景                     |              |
| params |               | 不同的事件类型返回的数据               |
|        | form          | Form 实例对象                          | form、ticket |
|        | urlParams     | 路由参数信息                           | form、ticket |
|        | originBizData | 通过 storageSQL 方式传递给组件的数据   | form、ticket |
|        | data          | 工单数据                               | ticket       |
|        | snap          | 提交工单时自定义的 json 字符串内容     | ticket       |

#### onOk

提交按钮执行事件，主要关注 snap 参数的提交，该字段目前还未集成到后端的工单 jar 包中，用例如下：

```jsx | pure
onOk={(values) => {
  request('/book/manual/event/save.json', {
    setLoading,
    method: 'POST',
    data: {
      ...values,
      snap: JSON.stringify({ bizData }), // bizData 是固定参数名，用来存储必要的数据信息
    },
  }).then(() => {
    setSuccess(true);
    message.success('提交成功，请前往工单进行查看');
  });
}}
```
