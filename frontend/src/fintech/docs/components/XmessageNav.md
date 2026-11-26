---
group: agent
title: XmessageNav
order: 5
---

# XmessageNav

`XmessageNav` 是面向聊天、问答、Copilot 场景的消息导航轨组件，用于在长会话中快速跳到指定消息，并与 `Xmessages` 的 `actionRef.scrollTo({ key })` 配合使用。

它只负责导航轨自身的交互和展现，不内置悬浮定位。页面上需要把轨道放到消息列表左侧时，由调用方用绝对定位容器包裹即可。

## 使用说明

- `items` 是唯一核心输入，每项至少提供 `key` 和 `content`；`key` 应与 `Xmessages` 中消息项的 `key` 保持一致
- 非受控模式下，默认自动跟随最后一条消息；可通过 `followLast={false}` 关闭
- 受控模式传 `activeKey` + `onActiveChange`，此时组件不再维护内部激活态
- `onNavigate` 在点击后触发，业务方在此调用 `Xmessages` 的 `scrollTo({ key, behavior: 'smooth' })`
- `preview` 默认用 `Xmarkdown` 渲染 `item.content`，可直接传 ReactNode 覆盖
- 少于 `minVisible` 条时不展示

## 代码演示

```jsx
/**
 * title: 配合 Xmessages 滚动定位
 * description: 左侧导航轨叠加在消息列表上；消息数量少于 minVisible 时不会展示。点击轨道项可平滑滚动到对应消息。
 */
import React, { useRef } from 'react';
import { Xmessages, XmessageNav } from 'fintech/x';

const messages = [
  {
    key: 'assistant-1',
    role: 'assistant',
    label: '开场',
    content: '你好，我是你的 AI 助手。',
  },
  {
    key: 'user-1',
    role: 'user',
    label: '提问 1',
    content: '什么是 XmessageNav？',
  },
  {
    key: 'assistant-2',
    role: 'assistant',
    label: '解释 1',
    content: 'XmessageNav 是用于长会话快速定位的侧边导航轨。',
  },
  {
    key: 'user-2',
    role: 'user',
    label: '提问 2',
    content: '它如何和 Xmessages 配合使用？',
  },
  {
    key: 'assistant-3',
    role: 'assistant',
    label: '解释 2',
    content: '在 onNavigate 中调用 Xmessages 的 scrollTo({ key })。',
  },
  {
    key: 'user-3',
    role: 'user',
    label: '追问',
    content: '请给出一个最小示例。',
  },
  {
    key: 'assistant-4',
    role: 'assistant',
    label: '总结',
    content: '当前页面就是最小示例，可以滚动列表并点击导航定位。',
  },
];

export default () => {
  const messagesRef = useRef(null);

  const handleNavigate = (key) => {
    messagesRef.current?.scrollTo({ key, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        position: 'relative',
        height: 480,
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 16,
          zIndex: 2,
          transform: 'translateY(-50%)',
        }}
      >
        <XmessageNav items={messages} onNavigate={handleNavigate} />
      </div>
      <div style={{ height: '100%', paddingLeft: 48 }}>
        <Xmessages
          actionRef={messagesRef}
          items={messages}
          listProps={{ style: { height: '100%', overflowY: 'auto' } }}
        />
      </div>
    </div>
  );
};
```

## API

| 属性               | 说明                               | 类型                               | 默认值                          |
| :----------------- | :--------------------------------- | :--------------------------------- | :------------------------------ |
| `items`            | 导航消息列表                       | `{ key, content, label? }[]`       | `[]`                            |
| `activeKey`        | 受控激活项                         | `string \| number`                 | -                               |
| `defaultActiveKey` | 初始激活项                         | `string \| number`                 | 最后一条消息的 `key`            |
| `followLast`       | `items` 变化时是否自动跟随最后一条 | `boolean`                          | `true`                          |
| `minVisible`       | 展示导航轨所需的最少消息数         | `number`                           | `4`                             |
| `preview`          | 悬停预览内容                       | `ReactNode \| (info) => ReactNode` | `Xmarkdown` 渲染 `item.content` |
| `onActiveChange`   | 激活项变化回调                     | `(key) => void`                    | -                               |
| `onNavigate`       | 点击导航项回调                     | `(key, item, index) => void`       | -                               |
| `className`        | 外层轨道容器类名                   | `string`                           | -                               |
| `style`            | 外层轨道容器样式                   | `CSSProperties`                    | -                               |
