---
group: agent
title: Xmessages
order: 4
---

# Xmessages

`Xmessages` 是一个面向聊天、问答、Copilot 场景的消息列表封装。

它基于 `@ant-design/x` 的 `Bubble.List` 做了一层业务适配，负责处理消息角色、空态、首屏 loading、自动滚动，以及消息内容渲染。默认情况下，纯文本内容会使用 `Xmarkdown` 渲染，因此天然支持 Markdown 和 Latex。

## 使用说明

- `items` 是唯一核心输入，组件会把业务消息结构转换成 `Bubble.List` 可识别的列表项
- 每条消息都应显式提供 `key` 和 `role`，这是底层 `Bubble.List` 的标准必填字段
- `renderers` 用于渲染结构化消息；命中 `item.type` 时优先执行对应的 render 函数
- 未命中任何 renderer 时：
  - `ReactElement` 类型的 `content` 会直接原样渲染
  - `string` 和 `number` 类型的 `content` 会默认走 `Xmarkdown`
- `loading` 只会在“没有任何消息”时显示整页加载态；如果已有消息，列表会继续显示
- 组件内部会在用户位于底部时自动跟随最新消息；用户上拉查看历史消息后会显示一个回到底部按钮
- 如需关闭自动滚动，可传 `listProps={{ autoScroll: false }}`
- `more` 用于控制顶部“加载更多”入口；业务只需要决定是否打开、是否加载中以及点击后做什么
- `role` 用于统一定义不同角色的头像和布局；单条消息仍可通过 `placement`、`avatar`、`bubbleProps` 覆盖
- `role[roleName]` 既可以是对象，也可以是函数；如果你在 `header/footer/avatar` 里需要访问原始消息，可从 `info.extraInfo.item` 读取

## 代码演示

````jsx
/**
 * title: 综合演示
 * description: 进入页面先展示 empty，2 秒后切换 loading，再 2 秒后渲染消息列表，同时覆盖 Markdown、自定义 renderer、角色插槽、header/footer、顶部加载更多和 actionRef 滚动控制
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Space,
  Spin,
  Tag,
  message,
} from 'antd';
import { RobotOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Xmessages } from 'fintech/x';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Footer = ({ data }) => {
  return (
    <Space size={8}>
      <Tag color={data.status === 'loading' ? 'processing' : 'default'}>
        {data.status}
      </Tag>
      <span>{data.author}</span>
    </Space>
  );
};

const sharedRole = {
  header: (_, info) => info.extraInfo?.item?.gmt_create,
  footer: (_, info) => <Footer data={info.extraInfo?.item} />,
};

const createReadyItems = () => [
  {
    key: 'assistant-1',
    role: 'ASSISTANT',
    status: 'success',
    content: '你好，我是 **AI 助手**，下面先给你一个 JavaScript 示例。',
    gmt_create: '2026-06-23 10:00:00',
    author: 'assistant',
  },
  {
    key: 'user-1',
    role: 'USER',
    status: 'success',
    content: '请顺便展示一下工具调用结果和消息状态能力。',
    gmt_create: '2026-06-23 10:00:06',
    author: 'x',
  },
  {
    key: 'assistant-2',
    role: 'ASSISTANT',
    status: 'success',
    content: [
      '```js',
      'const sum = (a, b) => a + b;',
      "console.log('sum =', sum(1, 2));",
      '```',
    ].join('\n'),
    gmt_create: '2026-06-23 10:00:12',
    author: 'assistant',
  },
  {
    key: 'tool-1',
    role: 'TOOL',
    type: 'tool',
    status: 'success',
    content: '查询 EUR/CNY 最新参考汇率',
    meta: {
      title: 'exchange-rate',
      status: 'success',
    },
    gmt_create: '2026-06-23 10:00:18',
    author: 'toolkit',
  },
  {
    key: 'assistant-3',
    role: 'ASSISTANT',
    status: 'loading',
    content: '正在整理最终结论...',
    gmt_create: '2026-06-23 10:00:25',
    author: 'assistant',
  },
];

export default () => {
  const actionRef = useRef(null);
  const [phase, setPhase] = useState('empty');
  const [loadingMore, setLoadingMore] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      await wait(2000);
      if (!active) return;
      setPhase('loading');

      await wait(2000);
      if (!active) return;
      setItems(createReadyItems());
      setPhase('ready');
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Flex vertical gap={12}>
      <Space wrap>
        <Button
          onClick={() =>
            actionRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          }
        >
          滚到顶部
        </Button>
        <Button
          onClick={() =>
            actionRef.current?.scrollTo({ key: 'tool-1', behavior: 'smooth' })
          }
        >
          定位工具消息
        </Button>
        <Button
          type="primary"
          onClick={() =>
            actionRef.current?.scrollTo({
              top: 'bottom',
              behavior: 'smooth',
            })
          }
        >
          滚到最新消息
        </Button>
      </Space>

      <div
        style={{
          height: 520,
          border: '1px solid #f0f0f0',
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Xmessages
          actionRef={actionRef}
          loading={phase === 'loading'}
          listProps={{
            style: {
              height: '100%',
              overflowY: 'auto',
            },
          }}
          renderers={{
            tool: ({ item }) => (
              <Card size="small" title={item.meta?.title || '工具调用'}>
                <Space wrap>
                  <Tag color="blue">{item.meta?.status || 'running'}</Tag>
                  <span>{item.content}</span>
                </Space>
              </Card>
            ),
          }}
          slots={{
            loading: ({ loading }) =>
              loading ? (
                <Flex justify="center" style={{ padding: 24 }}>
                  <Spin tip="正在初始化会话..." />
                </Flex>
              ) : null,
            empty: (
              <Empty description="当前还没有任何消息，2 秒后会切到 loading 演示" />
            ),
          }}
          more={{
            open: phase === 'ready',
            text: '加载更早的历史消息',
            loading: loadingMore,
            onClick: async () => {
              setLoadingMore(true);
              await wait(600);
              setItems((prev) => [
                {
                  key: `history-${Date.now()}`,
                  role: 'ASSISTANT',
                  status: 'success',
                  content: '这是刚刚加载出来的一条历史消息。',
                  gmt_create: '2026-06-23 09:58:00',
                  author: 'assistant',
                },
                ...prev,
              ]);
              setLoadingMore(false);
              message.success('已加载更多');
            },
          }}
          role={{
            USER: {
              ...sharedRole,
              placement: 'end',
              avatar: (
                <Avatar
                  icon={<UserOutlined />}
                  style={{ background: '#95de64' }}
                />
              ),
            },
            ASSISTANT: (data) => ({
              ...sharedRole,
              loading: data.status === 'loading',
              avatar: (
                <Avatar
                  icon={<RobotOutlined />}
                  style={{ background: '#1677ff' }}
                />
              ),
            }),
            TOOL: {
              ...sharedRole,
              avatar: (
                <Avatar
                  icon={<ToolOutlined />}
                  style={{ background: '#faad14' }}
                />
              ),
            },
          }}
          items={items}
        />
      </div>
    </Flex>
  );
};
````

## 标准消息结构

```ts
type MessageItem = {
  key: string | number;
  role: string;
  type?: string;
  content?: any;
  status?: 'loading' | 'success' | 'error' | 'abort';
  placement?: 'start' | 'end';
  avatar?: React.ReactNode;
  typing?: boolean;
  extraInfo?: Record<string, any>;
  meta?: Record<string, any>;
  bubbleProps?: Record<string, any>;
};
```

## API

| 参数            | 说明                                                                                                                                     | 类型                                                                                                                                       | 默认值  |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| `actionRef`     | 自定义触发组件内部的方法，透传了 `Bubble.List` 的 ref                                                                                    |                                                                                                                                            |         |
| `items`         | 消息列表，组件的核心输入，每项至少需要提供 `key` 和 `role`                                                                               | `MessageItem[]`                                                                                                                            | `[]`    |
| `loading`       | 是否处于首屏加载状态。仅在 `items` 为空时显示 loading 视图                                                                               | `boolean`                                                                                                                                  | `false` |
| `renderers`     | 自定义消息渲染函数映射，按 `item.type` 命中                                                                                              | `Record<string, ({ item }: { item: MessageItem }) => React.ReactNode>`                                                                     | `{}`    |
| `slots`         | 状态插槽，支持覆盖 `loading` 和 `empty`                                                                                                  | `{ loading?: ReactNode \| (info) => ReactNode; empty?: ReactNode \| (info) => ReactNode }`                                                 | `{}`    |
| `more`          | 顶部“加载更多”控制项，内部会合成一条 `role='system'` 的消息入口                                                                          | `{ open?: boolean; text?: ReactNode; loading?: boolean; disabled?: boolean; onClick?: () => void \| Promise<void>; bubbleProps?: object }` | `{}`    |
| `role`          | 不同角色的气泡配置，会合并到 `Bubble.List` 的 `role` 上，支持对象或函数                                                                  | `Record<string, object \| (data) => object>`                                                                                               | `{}`    |
| `listProps`     | 透传给底层 `Bubble.List` 的额外属性                                                                                                      | `object`                                                                                                                                   | `{}`    |
| `markdownProps` | 透传给文本消息所用 `Xmarkdown` 的属性，可用于放行自定义协议链接，例如 `{ dompurifyConfig: { ALLOWED_URI_REGEXP } }`、`openLinksInNewTab` | `object`                                                                                                                                   | `{}`    |

## role 插槽上下文

`Xmessages` 会把原始消息对象注入到 `info.extraInfo.item`，因此 `role` 里的 `header/footer/avatar/extra` 都可以按官方签名读取它：

```ts
header: (_, info) => info.extraInfo?.item?.gmt_create;
footer: (_, info) => <Footer data={info.extraInfo?.item} />;
```

如果你需要按单条消息动态生成角色配置，也可以把 `role[roleName]` 写成函数：

```ts
role={{
  AGENT: (data) => ({
    header: (_, info) => info.extraInfo?.item?.gmt_create,
    loading: data.status === 'loading',
  }),
}}
```

## 渲染优先级

`Xmessages` 对单条消息内容的渲染顺序如下：

1. `renderers[item.type]({ item })`
2. `item.content` 为 `ReactElement` 时直接渲染
3. `item.content` 为 `string` 或 `number` 时使用 `Xmarkdown`
4. 其余情况返回 `null`
