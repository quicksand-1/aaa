---
group: agent
title: Xllm
order: 1
---

# Xllm

`Xllm` 不是一个默认导出的单组件，而是一组和 LLM 配置相关的能力集合。

当前从 `fintech/x` 子入口导出的能力有：

- `LLMConfig`
- `getLLMConfig`

## 使用说明

- 配置列表统一存储在 `storageSQL` 的 `llm_configs` 表中
- `getLLMConfig()` 始终返回当前启用的配置，便于业务侧直接发请求

## 代码演示

```jsx
/**
 * title: 配置入口
 * description: 使用 LLMConfig 维护本地 LLM 列表
 */
import React from 'react';
import { Space } from 'antd';
import { LinkBtn } from 'fintech';
import { LLMConfig } from 'fintech/x';

export default () => {
  return (
    <Space orientation="vertical" style={{ width: '100%' }}>
      <LLMConfig>
        <LinkBtn variant="solid">打开 LLM 配置</LinkBtn>
      </LLMConfig>
    </Space>
  );
};
```

## 调用示例

```ts
import { getLLMConfig } from 'fintech/x';

const config = getLLMConfig();

if (!config?.id) {
  console.warn('当前没有启用的 LLM 配置');
} else {
  console.log('当前启用模型：', config.model);
  console.log('当前接口地址：', config.baseUrl);
}
```

## API

### `LLMConfig`

| 参数     | 说明           | 类型        | 默认值 |
| :------- | :------------- | :---------- | :----- |
| children | 自定义触发节点 | `ReactNode` | -      |

### `getLLMConfig`

返回当前显式启用的 LLM 配置；如果当前没有启用项，则返回空对象。
