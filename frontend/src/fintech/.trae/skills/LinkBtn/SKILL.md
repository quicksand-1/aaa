---
name: 'LinkBtn'
description: 'Generates code using the LinkBtn component for enhanced buttons with link functionality. Invoke when user wants to create buttons with tooltip, confirm dialog, loading state, or link navigation.'
---

# LinkBtn

这个技能帮助你使用 `fintech` 库中的 `LinkBtn` 组件生成代码。
该组件封装了 Ant Design Button 的增强型按钮组件，支持多种按钮形态、颜色主题、加载状态、Tooltip 提示以及二次确认弹窗等功能。

## 使用方法

`LinkBtn` 组件是一个多功能按钮组件，可以根据不同的属性渲染为按钮、链接或确认弹窗。

## 示例

```tsx
import React from 'react';
import { Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { LinkBtn } from 'fintech';

const MyComponent = () => {
  const handleDelete = () => {
    console.log('删除操作');
  };

  const handleSubmit = (input?: string) => {
    console.log('提交备注:', input);
  };

  return (
    <Space>
      <h3>基础用法</h3>
      <LinkBtn>普通按钮</LinkBtn>
      <LinkBtn color="red">红色按钮</LinkBtn>
      <LinkBtn disabled>禁用按钮</LinkBtn>
      <LinkBtn loading>加载按钮</LinkBtn>
      <LinkBtn>
        <EditOutlined /> 编辑
      </LinkBtn>

      <h3>颜色主题</h3>
      <LinkBtn color="primary">primary</LinkBtn>
      <LinkBtn color="purple">purple</LinkBtn>
      <LinkBtn color="green">green</LinkBtn>
      <LinkBtn color="orange">orange</LinkBtn>

      <h3>链接跳转</h3>
      <LinkBtn to="/home">首页</LinkBtn>
      <LinkBtn to="/user/profile">个人中心</LinkBtn>
      <LinkBtn to="/settings" target="_blank">
        设置
      </LinkBtn>

      <h3>二次确认弹窗</h3>
      <LinkBtn
        color="red"
        title="删除"
        content="确定删除该信息？"
        onOk={handleDelete}
      >
        删除
      </LinkBtn>
      <LinkBtn
        remark
        placeholder="请输入原因"
        title="提示"
        content="确认提交该内容？"
        onOk={handleSubmit}
      >
        提交
      </LinkBtn>

      <h3>Tooltip 提示</h3>
      <LinkBtn tooltip="点击查看详情">查看详情</LinkBtn>
      <LinkBtn tooltip="顶部提示" tooltipProps={{ placement: 'top' }}>
        顶部提示
      </LinkBtn>

      <h3>条件渲染</h3>
      <LinkBtn open={true}>显示按钮</LinkBtn>
      <LinkBtn open={false}>隐藏按钮</LinkBtn>

      <h3>自定义 children 模式</h3>
      <LinkBtn
        method={false}
        title="删除"
        content="确定删除该信息？"
        onOk={handleDelete}
      >
        <DeleteOutlined />
      </LinkBtn>
    </Space>
  );
};

export default MyComponent;
```

## 组件 API

### 基础属性

| 参数           | 类型                                                                | 默认值      | 说明                                                           |
| -------------- | ------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `variant`      | `'solid' \| 'outlined' \| 'dashed' \| 'filled' \| 'text' \| 'link'` | `'link'`    | 按钮形态                                                       |
| `disabled`     | `boolean`                                                           | `false`     | 设置按钮失效状态                                               |
| `loading`      | `boolean`                                                           | `false`     | 设置按钮载入状态                                               |
| `color`        | `string`                                                            | `'primary'` | 按钮颜色，支持 13 种预设颜色                                   |
| `to`           | `string`                                                            | -           | Link 的跳转地址                                                |
| `open`         | `boolean`                                                           | `true`      | 是否可见，请不要使用原生的 hidden                              |
| `tooltip`      | `React.ReactNode`                                                   | -           | 提示文本，支持 React 节点                                      |
| `tooltipProps` | `object`                                                            | -           | 提示框属性，可自定义位置、样式等，参考 Ant Design Tooltip 组件 |

### Confirm 模式属性

| 参数          | 类型                  | 默认值       | 说明                                                     |
| ------------- | --------------------- | ------------ | -------------------------------------------------------- |
| `onOk`        | `(res?: any) => void` | -            | 确定按钮的回调（触发 confirm 模式）                      |
| `title`       | `ReactNode`           | -            | 提示信息的标题                                           |
| `content`     | `ReactNode`           | -            | 提示信息的内容                                           |
| `okText`      | `string`              | `'确定'`     | 确认按钮的文案                                           |
| `cancelText`  | `string`              | `'取消'`     | 取消按钮的文案                                           |
| `remark`      | `boolean`             | `false`      | 简易输入框，可在 onOk 中获取输入内容                     |
| `placeholder` | `string`              | `'备注信息'` | 输入框占位符                                             |
| `method`      | `boolean`             | `true`       | 按钮模式；true 时使用 LinkBtn，false 时可自定义 children |
| `modalProps`  | `ModalProps`          | `{}`         | Modal.confirm 的属性                                     |

### 其他属性

| 参数        | 类型                  | 默认值 | 说明         |
| ----------- | --------------------- | ------ | ------------ |
| `children`  | `React.ReactNode`     | -      | 按钮内容     |
| `className` | `string`              | -      | 自定义类名   |
| `style`     | `React.CSSProperties` | -      | 自定义样式   |
| `onClick`   | `(e: any) => void`    | -      | 点击事件     |
| `target`    | `string`              | -      | 链接打开方式 |

## 颜色主题

支持 13 种预设颜色：

- `primary`（系统主色）
- `purple`
- `cyan`
- `green`
- `magenta`
- `pink`
- `red`
- `orange`
- `yellow`
- `volcano`
- `geekblue`
- `lime`
- `gold`

## 最佳实践

- **基础按钮**：使用默认的 `link` 形态，适合表格操作栏等场景
- **危险操作**：使用 `color="red"` 配合 `onOk` 属性实现二次确认
- **需要备注的操作**：使用 `remark` 属性启用输入框，在 `onOk` 回调中获取输入内容
- **链接跳转**：使用 `to` 属性实现页面跳转，支持 `target` 属性控制打开方式
- **条件渲染**：使用 `open` 属性控制组件显示/隐藏，替代原生 `hidden`
- **Tooltip 提示**：使用 `tooltip` 和 `tooltipProps` 为按钮添加提示信息
- **自定义 children 模式**：设置 `method={false}` 可以使用自定义 React 节点作为触发器

## 参考文档（相对路径）

- **组件文档**：[docs/components/LinkBtn.md](docs/components/LinkBtn.md)
- **组件源码**：[src/LinkBtn/index.tsx](src/LinkBtn/index.tsx)
- **组件分析报告**：[document/LinkBtn/README.md](document/LinkBtn/README.md)
