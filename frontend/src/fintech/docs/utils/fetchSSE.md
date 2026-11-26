---
group: 请求
toc: content
title: fetchSSE
order: 2
---

# fetchSSE

SSE (Server-Sent Events) 流式请求工具，用于处理服务端推送的流式数据。

## 代码演示

```jsx
/**
 * title: 基础用法
 * description: 模拟 SSE 流式数据请求
 */
import React, { useState } from 'react';
import { Button, Input, Space, Typography } from 'antd';
import { fetchSSE } from 'fintech';

export default () => {
  const [events, setEvents] = useState([]);
  const [input, setInput] = useState('你好');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setEvents([]);

    // 模拟 SSE 请求（实际使用时替换为真实 API）
    const mockSSEData = [
      'event: started\ndata: {"status":"processing"}\n\n',
      'event: answer_delta\ndata: {"deltaText":"正在"}\n\n',
      'event: answer_delta\ndata: {"deltaText":"思考"}\n\n',
      'event: answer_delta\ndata: {"deltaText":"..."}\n\n',
      'event: completed\ndata: {"status":"done"}\n\n',
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        mockSSEData.forEach((chunk) => {
          controller.enqueue(encoder.encode(chunk));
        });
        controller.close();
      },
    });

    global.fetch = () =>
      Promise.resolve({
        ok: true,
        status: 200,
        body: stream,
      });

    const { done } = fetchSSE('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
      callback: (event, data) => {
        setEvents((prev) => [...prev, { event, data }]);
      },
    });

    await done;
    setLoading(false);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息"
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleSend} loading={loading}>
          发送
        </Button>
      </Space>
      <div style={{ marginTop: 16 }}>
        {events.map((item, index) => (
          <Typography.Text key={index}>
            <strong>{item.event}:</strong> {JSON.stringify(item.data)}{' '}
          </Typography.Text>
        ))}
      </div>
    </Space>
  );
};
```

```jsx
/**
 * title: 可取消的 SSE 请求
 * description: 使用 cancel 方法中断连接
 */
import React, { useState, useRef } from 'react';
import { Button, Space, Typography, Alert } from 'antd';
import { fetchSSE } from 'fintech';

export default () => {
  const [events, setEvents] = useState([]);
  const [cancelled, setCancelled] = useState(false);
  const cancelRef = useRef(null);

  const handleStart = () => {
    setEvents([]);
    setCancelled(false);

    const mockSSEData = [
      'event: answer_delta\ndata: {"deltaText":"第"}\n\n',
      'event: answer_delta\ndata: {"deltaText":"一"}\n\n',
      'event: answer_delta\ndata: {"deltaText":"条"}\n\n',
    ];

    const encoder = new TextEncoder();
    let index = 0;

    const stream = new ReadableStream({
      pull(controller) {
        if (index < mockSSEData.length) {
          controller.enqueue(encoder.encode(mockSSEData[index]));
          index++;
        } else {
          controller.close();
        }
      },
      cancel() {
        setCancelled(true);
      },
    });

    global.fetch = () =>
      Promise.resolve({
        ok: true,
        status: 200,
        body: stream,
      });

    const { done, cancel } = fetchSSE('/api/stream', {
      callback: (event, data) => {
        setEvents((prev) => [...prev, { event, data }]);
      },
    });

    cancelRef.current = cancel;
    done.then(() => console.log('SSE 完成'));
  };

  const handleCancel = () => {
    if (cancelRef.current) {
      cancelRef.current();
    }
  };

  return (
    <Space direction="vertical">
      <Space>
        <Button type="primary" onClick={handleStart}>
          开始请求
        </Button>
        <Button danger onClick={handleCancel}>
          取消请求
        </Button>
      </Space>
      {cancelled && <Alert type="warning" message="请求已取消" />}
      <div>
        {events.map((item, index) => (
          <Typography.Text key={index}>
            {item.data?.deltaText || ''}
          </Typography.Text>
        ))}
      </div>
    </Space>
  );
};
```

```jsx
/**
 * title: 结合 Xmessages 展示深度思考
 * description: 解析复杂 SSE 数据流，使用 Xmessages 和 Think 组件渲染 AI 思考与回答
 */
import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { Think } from '@ant-design/x';
import { fetchSSE } from 'fintech';
import { Xmessages } from 'fintech/x';

const MOCK_CHUNKS = [
  'data: {"v":{"response":{"fragments":[{"id":1,"type":"THINK","content":""}]}}}\n\n',
  'data: {"p":"response/fragments/-1/content","o":"APPEND","v":"用户想知道"}\n\n',
  'data: {"v":"关于 React"}\n\n',
  'data: {"v":" Hooks 的"}\n\n',
  'data: {"v":"最佳实践"}\n\n',
  'data: {"v":"。"}\n\n',
  'data: {"p":"response/fragments/-1/elapsed_secs","o":"SET","v":1.5}\n\n',
  'data: {"p":"response/fragments","o":"APPEND","v":[{"id":2,"type":"RESPONSE","content":""}]}\n\n',
  'data: {"p":"response/fragments/-1/content","o":"APPEND","v":"React Hooks"}\n\n',
  'data: {"v":" 的最佳实践包括：\\n\\n"}\n\n',
  'data: {"v":"1. **使用 useMemo"}\n\n',
  'data: {"v":" 和 useCallback** 优化性能"}\n\n',
  'event: close\ndata: {"click_behavior":"none"}\n\n',
];

export default () => {
  const [fragments, setFragments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setFragments([]);
    setLoading(true);

    const encoder = new TextEncoder();
    let idx = 0;
    const stream = new ReadableStream({
      async pull(controller) {
        if (idx < MOCK_CHUNKS.length) {
          await new Promise((r) => setTimeout(r, 200));
          controller.enqueue(encoder.encode(MOCK_CHUNKS[idx]));
          idx += 1;
        } else {
          controller.close();
        }
      },
    });

    global.fetch = () =>
      Promise.resolve({ ok: true, status: 200, body: stream });

    const { done } = fetchSSE('/api/chat', {
      callback: (event, data) => {
        if (event !== 'message') return;
        // 1. 初始化 response.fragments
        if (data?.v?.response?.fragments) {
          setFragments(data.v.response.fragments);
          return;
        }
        // 2. 追加新片段（开启 RESPONSE 阶段）
        if (data?.p === 'response/fragments' && data?.o === 'APPEND') {
          setFragments((prev) => [...prev, ...data.v]);
          return;
        }
        // 3. 设置最后一个片段的字段，如 elapsed_secs
        if (
          data?.p === 'response/fragments/-1/elapsed_secs' &&
          data?.o === 'SET'
        ) {
          setFragments((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last) next[next.length - 1] = { ...last, elapsed_secs: data.v };
            return next;
          });
          return;
        }
        // 4. 追加最后一个片段的 content：完整路径或简写形式都视为追加
        const isAppend =
          data?.p === 'response/fragments/-1/content' && data?.o === 'APPEND';
        const isShorthand =
          data?.p === undefined && typeof data?.v === 'string';
        if (isAppend || isShorthand) {
          setFragments((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last) {
              next[next.length - 1] = {
                ...last,
                content: (last.content || '') + data.v,
              };
            }
            return next;
          });
        }
      },
    });

    await done;
    setLoading(false);
  };

  // 把 fragments 映射为 Xmessages items：THINK 走自定义 type='think' 渲染，RESPONSE 走默认 markdown
  const items = fragments.map((f) => {
    if (f.type === 'THINK') {
      return { key: f.id, role: 'assistant', type: 'think', content: f };
    }
    return { key: f.id, role: 'assistant', content: f.content };
  });

  const renderers = {
    think: ({ item }) => {
      const f = item.content;
      const finished = typeof f.elapsed_secs === 'number';
      return (
        <Think
          title={
            finished ? `已深度思考（用时 ${f.elapsed_secs}s）` : '深度思考中...'
          }
          loading={!finished}
          defaultExpanded
        >
          {f.content}
        </Think>
      );
    },
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button type="primary" onClick={handleStart} loading={loading}>
        开始深度思考
      </Button>
      <div style={{ marginTop: 16 }}>
        <Xmessages items={items} renderers={renderers} />
      </div>
    </Space>
  );
};
```

## API

### fetchSSE(url, options)

返回对象包含 `cancel` 和 `done` 属性。

| 参数    | 说明     | 类型                  | 默认值 |
| :------ | :------- | :-------------------- | :----- |
| url     | 请求地址 | `string`              | -      |
| options | 请求选项 | `SSEOptions` (见下方) | -      |

### SSEOptions

继承标准 `RequestInit` 接口，额外包含 `callback` 字段。

| 参数     | 说明                                | 类型                                     | 默认值  |
| :------- | :---------------------------------- | :--------------------------------------- | :------ |
| callback | SSE 事件回调函数                    | `(event: string, data: unknown) => void` | -       |
| method   | 请求方法                            | `string`                                 | `'GET'` |
| headers  | 请求头                              | `HeadersInit`                            | -       |
| body     | 请求体                              | `BodyInit`                               | -       |
| signal   | AbortSignal（可与 cancel 配合使用） | `AbortSignal`                            | -       |

### 返回值

| 属性   | 说明                        | 类型            |
| :----- | :-------------------------- | :-------------- |
| cancel | 取消 SSE 连接的方法         | `() => void`    |
| done   | Promise，连接完成时 resolve | `Promise<void>` |

## 使用示例

### 基础用法

```ts | pure
import { fetchSSE } from 'fintech';

const { done } = fetchSSE('/api/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token',
  },
  body: JSON.stringify({ query: '用户输入' }),
  callback: (event, data) => {
    console.log(`事件类型: ${event}`);
    console.log('数据:', data);
  },
});

// 等待流式数据完成
await done;
```

### 取消请求

```ts | pure
import { fetchSSE } from 'fintech';

const { done, cancel } = fetchSSE('/api/chat', {
  callback: (event, data) => {
    if (event === 'answer_delta') {
      // 处理增量文本
      console.log(data.deltaText);
    }
  },
});

// 用户点击取消按钮时调用
document.getElementById('cancel-btn').onclick = () => {
  cancel();
};

await done; // 取消后 done 会 resolve
```

### SSE 数据格式示例

```text | pure
event: started
data: {"traceId":"abc123","question":"用户问题"}

event: recall_ready
data: "参考文献内容"

event: answer_delta
data: {"chunkIndex":1,"deltaText":"正在"}

event: answer_delta
data: {"chunkIndex":2,"deltaText":"思考"}

event: completed
data: {"status":"done"}
```

## 特性说明

- **自动 JSON 解析**：如果 `data` 字段能被 `JSON.parse` 解析，会自动转换为对象/数组/数字等类型
- **多行 data 支持**：连续的 `data:` 行会被合并为单个字符串（用 `\n` 连接）
- **默认事件名**：未指定 `event:` 时，默认事件名为 `'message'`
- **错误处理**：HTTP 错误（非 2xx）会抛出异常，可通过 `done.catch()` 捕获
- **取消机制**：调用 `cancel()` 会中断底层 fetch 请求，流式数据停止接收

## 典型应用场景

- AI 对话流式输出（如 ChatGPT、LLM 接口）
- 实时消息推送
- 大文件处理进度通知
- 实时数据监控面板
