---
group: agent
title: Xagent
order: 3
---

# Xagent

`Xagent` 不是一个 UI 组件，而是一套面向多轮问答场景的轻量 Agent Runtime。

当前从 `fintech/x` 子入口导出的能力有：

- `createAgentRunner`
- `DEFAULT_AGENT_SESSION_STATE`

## 使用说明

- 用 `createAgentRunner()` 注册一组 capability，得到一个可直接调用的 `runAgent` 方法
- 每个 capability 负责一个明确意图域，例如“查书签”“查用户”“查订单”
- runtime 会按 `routeKeywords` 和当前会话状态自动选择 capability，也支持通过 `selectCapability` 自定义路由
- 每次调用返回的 `sessionState` 都要由业务层保存，并在下一轮继续传回去，这样才能支持追问、澄清和上下文续跑
- LLM 配置优先级是：`runAgent({ llmConfig })` > `createAgentRunner({ api })` > 当前启用的 `Xllm` 配置
- 所有 capability 里的工具名必须全局唯一；`agent_clarify` 是内部保留工具名，不要占用

## 代码演示

```ts | pure
/**
 * title: 基础接入
 * description: 注册一个 capability，并把 sessionState 在多轮对话之间续传
 */
import { createAgentRunner, DEFAULT_AGENT_SESSION_STATE } from 'fintech/x';

const booksCapability = {
  id: 'books',
  label: '网址助手',
  routeKeywords: ['网址', '地址', '链接', '入口', 'jenkins', 'gitlab'],
  defaultIntent: 'bookmark_lookup',
  systemPrompt: '你是公司内部网址助手，优先根据工具结果回答。',
  slots: {
    queryText: {
      label: '查询内容',
      defaultValue: null,
      schema: {
        type: ['string', 'null'],
      },
      normalize: (value) => {
        const text = String(value || '').trim();
        return text || null;
      },
    },
  },
  tools: [
    {
      type: 'function',
      name: 'books_search_links',
      description: '根据关键字查询公司书签地址。',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          queryText: {
            type: ['string', 'null'],
            description: '要查询的网址关键字。',
          },
        },
        required: ['queryText'],
      },
      intent: 'bookmark_lookup',
      execute: async ({ args }) => {
        const data = await searchBookmarks(args.queryText);
        return {
          data,
          resultCount: data.length,
        };
      },
    },
  ],
};

const runAgent = createAgentRunner({
  capabilities: [booksCapability],
  api: {
    baseUrl: 'https://your-llm-endpoint/v1',
    apiKey: 'sk-xxx',
    model: 'gpt-5.4',
  },
});

let sessionState = DEFAULT_AGENT_SESSION_STATE;

const result = await runAgent({
  question: 'Jenkins 地址',
  sessionState,
});

sessionState = result.sessionState;
console.log(result.type, result.answer);
```

```jsx | pure
/**
 * title: 配合 Xmessages / Xsender
 * description: UI 层只负责传 question、保存 sessionState 和展示 answer
 */
import React, { useState } from 'react';
import { DEFAULT_AGENT_SESSION_STATE, Xmessages, Xsender } from 'fintech/x';
import { runAgent } from './agent';

export default () => {
  const [messages, setMessages] = useState([]);
  const [running, setRunning] = useState(false);
  const [sessionState, setSessionState] = useState(DEFAULT_AGENT_SESSION_STATE);

  const handleSubmit = async (question) => {
    if (!question.trim() || running) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { key: `${Date.now()}-user`, role: 'user', content: question },
    ]);

    setRunning(true);

    try {
      const result = await runAgent({
        question,
        sessionState,
      });

      setSessionState(result.sessionState || DEFAULT_AGENT_SESSION_STATE);
      setMessages((prev) => [
        ...prev,
        {
          key: `${Date.now()}-assistant`,
          role: 'assistant',
          content: result.answer,
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <Xmessages items={messages} />
      <Xsender loading={running} onSubmit={handleSubmit} />
    </>
  );
};
```

## API

### `createAgentRunner`

```ts | pure
const runAgent = createAgentRunner(options);
```

| 参数               | 说明                       | 类型                              | 默认值                       |
| :----------------- | :------------------------- | :-------------------------------- | :--------------------------- |
| `capabilities`     | 预注册的 capability 列表   | `Capability[]`                    | `[]`                         |
| `api`              | 默认 LLM 配置              | `LLMConfig`                       | -                            |
| `maxLoops`         | 默认最大推理轮次           | `number`                          | `6`                          |
| `selectCapability` | 自定义 capability 路由函数 | `(context) => Capability \| null` | 内置 `selectAgentCapability` |

### `runAgent`

```ts | pure
const result = await runAgent({
  question,
  sessionState,
  llmConfig,
  capabilities,
});
```

| 参数           | 说明                           | 类型           | 默认值 |
| :------------- | :----------------------------- | :------------- | :----- |
| `question`     | 用户本轮输入                   | `string`       | `''`   |
| `sessionState` | 上一轮返回的会话状态           | `object`       | `{}`   |
| `llmConfig`    | 本轮覆盖的 LLM 配置            | `LLMConfig`    | -      |
| `capabilities` | 本轮临时覆盖的 capability 列表 | `Capability[]` | -      |

返回结果统一包含：

```ts | pure
{
  type: 'success' | 'clarify' | 'error',
  answer: string,
  steps: Array<{
    step: number,
    stage: 'agent_decision' | 'call_tool',
    ...
  }>,
  sessionState: object,
}
```

- `success`：已经拿到最终答案
- `clarify`：当前信息不够，`answer` 是应该继续向用户追问的话术
- `error`：流程异常或达到最大轮次

### `DEFAULT_AGENT_SESSION_STATE`

用于初始化会话状态，也可在重置会话时直接复用。

```ts | pure
{
  activeCapability: null,
  currentEntity: null,
  lastParsed: null,
  lastResult: null,
  pendingClarify: null,
  capabilities: {},
  toolCache: {},
  memory: {
    turns: [],
  },
}
```

## Capability 结构

一个 capability 就是一组“意图 + slots + tools”的定义。

| 字段            | 说明                                     | 类型                   |
| :-------------- | :--------------------------------------- | :--------------------- |
| `id`            | capability 唯一标识                      | `string`               |
| `label`         | 展示名称                                 | `string`               |
| `routeKeywords` | 路由关键字，用于默认 capability 选择     | `string[]`             |
| `defaultIntent` | 默认意图                                 | `string`               |
| `systemPrompt`  | 当前 capability 的系统提示词             | `string`               |
| `slots`         | 槽位定义，负责结构化保存上下文           | `Record<string, Slot>` |
| `entity`        | 实体定义，适合“先查对象，再查详情”的场景 | `object`               |
| `tools`         | 可调用工具列表                           | `Tool[]`               |
| `maxLoops`      | 当前 capability 自己覆盖的最大推理轮次   | `number`               |

### `slots`

```ts | pure
slots: {
  queryText: {
    label: '查询内容',
    defaultValue: null,
    schema: { type: ['string', 'null'] },
    normalize: (value, context) => value,
  },
}
```

- `label` 用于生成澄清问题
- `defaultValue` 用于初始化和补齐
- `schema` 会被复用到内部 `agent_clarify` 工具参数里
- `normalize` 会在每次写入 slot 时执行，适合做 trim、格式归一化

### `entity`

适合“先搜索实体，再按实体继续查详情”的场景。

```ts | pure
entity: {
  label: '用户',
  idSlot: 'userId',
  idKey: 'userId',
  displayKey: 'userName',
  aliasIdKeys: ['id'],
  lookupSlots: ['userId', 'mobile'],
}
```

### `tools`

```ts | pure
{
  type: 'function',
  name: 'user_get_detail',
  description: '根据用户 ID 查询详情',
  strict: true,
  parameters: { ...JSON Schema },
  intent: 'user_detail',
  usesEntity: true,
  requiredSlots: ['userId'],
  normalizeArgs: (args) => args,
  buildOutputInput: ({ args, slots, entityId }) => args,
  buildPatch: ({ args, result, basePatch }) => basePatch,
  execute: async ({ args, slots, entityId, currentEntity, loopState, sessionState }) => ({
    data: {},
    resultCount: 1,
    currentEntity,
  }),
}
```

常用约定：

- `execute()` 必填，返回 `{ data, resultCount? }` 或 `{ error }`
- `usesEntity: true` 时，runtime 会先检查实体是否已经定位完成
- `requiredSlots` 可显式声明这个工具依赖哪些 slot；缺失时会自动转为澄清
- `kind: 'entity.search'` 适合实体搜索工具，若结果唯一，runtime 会自动锁定 `currentEntity`

## 补充说明

- `steps` 是完整的推理轨迹，适合调试、埋点或在 UI 上展示“思考过程”
- runtime 会自动维护最近几轮对话摘要到 `sessionState.memory.turns`
- 如果用户是在补充上一轮问题，默认路由会优先沿用 `pendingClarify.capabilityId` 或 `activeCapability`
