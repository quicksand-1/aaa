---
group: agent
title: Xsender
order: 2
---

# Xsender

`Xsender` 是一个结构化输入内核，统一管理文本编辑、slash trigger、entity 插入、草稿缓存、历史导航和结构化提交。

核心思路：组件内部维护的不再是一个 `string`，而是一份结构化值。

## 值模型

```js
{
  text: ' 关于人口计划生育，当前需要注意什么？',
  segments: [
    {
      type: 'entity',
      entity: {
        id: 'region-shenzhen',
        entityType: 'metadata_filter',
        key: 'region',
        value: '深圳',
        label: '深圳',
        serializeText: '/region=深圳',
      },
    },
    {
      type: 'text',
      text: ' 关于人口计划生育，当前需要注意什么？',
    },
  ],
  entities: [
    {
      id: 'region-shenzhen',
      entityType: 'metadata_filter',
      key: 'region',
      value: '深圳',
      label: '深圳',
      serializeText: '/region=深圳',
    },
  ],
}
```

| 字段       | 说明                               |
| :--------- | :--------------------------------- |
| `text`     | 纯文本段拼接结果，不含 entity 展开 |
| `segments` | 输入区完整片段序列                 |
| `entities` | 从 `segments` 提取的结构化实体列表 |

值模型中不携带序列化策略。如需将 entity 展开为文本（如 trigger 匹配、存储展示），使用 `computeSerializedText(segments, entityToText?)` 工具函数。

注意：示例中的 `key`、`value` 等字段为**业务透传字段**，非 Xsender 核心协议。核心协议字段仅为 `entityType`、`id`、`label`、`serializeText`。

## 设计原则与最佳实践

- 业务方不要从输入文本里手动反解析结构化命令；如需读取结构化实体，直接访问 `value.entities`
- slash 选中结果必须保留完整业务对象，而不是只保存展示字符串
- 草稿和历史必须保存结构化值，不能在回填时丢掉 entity
- entity 持久化只存可序列化字段，不要存函数或 React 节点
- 同一 trigger 默认按"光标末尾的连续 token"匹配
- 如需自定义 entity 在文本中的表示（trigger 匹配、长度计算），通过 `entityToText` 注入业务策略

## 快速开始

```jsx
/**
 * title: 基础使用
 */
import React from 'react';
import { Xsender } from 'fintech/x';

export default () => {
  return (
    <Xsender
      onSubmit={(value) => {
        console.log('text:', value.text);
        console.log('entities:', value.entities);
      }}
      placeholder="输入问题，或输入 / 触发命令"
    />
  );
};
```

## Slash Trigger

```jsx
/**
 * title: 结构化 KV slash 筛选
 */
import React from 'react';
import { Xsender } from 'fintech/x';

const metadataOptions = [
  {
    id: 'region-shenzhen',
    label: '深圳',
    description: '地域',
    keywords: ['shen', 'shenzhen', 'region'],
    entity: { key: 'region', value: '深圳', label: '深圳' },
  },
  {
    id: 'type-rule',
    label: '法规',
    description: '类型',
    entity: { key: 'type', value: '法规', label: '法规' },
  },
];

export default () => {
  return (
    <Xsender
      placeholder="输入 / 选择结构化筛选"
      triggers={[
        {
          key: 'metadata',
          trigger: '/',
          entityType: 'metadata_filter',
          items: metadataOptions,
          serializeEntity: (entity) => `/${entity.key}=${entity.value}`,
        },
      ]}
      onSubmit={(value) => {
        const metadataFilters = value.entities
          .filter((item) => item.entityType === 'metadata_filter')
          .map((item) => ({ key: item.key, value: item.value }));

        console.log({ question: value.text, metadataFilters });
      }}
    />
  );
};
```

### Trigger Item 协议

| 字段          | 说明                              |
| :------------ | :-------------------------------- |
| `id`          | 稳定主键                          |
| `label`       | 候选项展示文案                    |
| `description` | 候选项补充说明                    |
| `keywords`    | 本地搜索关键字                    |
| `entity`      | 选中后插入的结构化实体            |
| `text`        | 选中后插入的纯文本                |
| `appendSpace` | 选中后是否自动补空格，默认 `true` |

规则：

- 有 `entity` 时插入为结构化 entity，没有 `entity` 但有 `text` 时插入为纯文本模板
- `items` 既可以直接传数组，也可以传 `(context) => Promise<items>`

### Trigger 配置项

| 字段              | 说明                                                      |
| :---------------- | :-------------------------------------------------------- |
| `key`             | trigger 唯一标识                                          |
| `trigger`         | 触发字符，如 `/`、`@`、`#`                                |
| `items`           | 候选项数组或 `(context) => Promise<items>`                |
| `entityType`      | entity 默认类型                                           |
| `serializeEntity` | `(entity, rawItem) => string`，将 entity 序列化为文本表示 |
| `itemToEntity`    | 当 item 没有 `entity` 字段时，动态构建 entity             |
| `getEntityLabel`  | 兜底生成 entity 展示 label                                |
| `allowDuplicate`  | 是否允许重复插入同一 entity，默认 `true`                  |

## 受控模式

```jsx
/**
 * title: 受控模式
 */
import React from 'react';
import { Button, Space } from 'antd';
import { Xsender } from 'fintech/x';

const buildTextValue = (text = '') => ({
  segments: text ? [{ type: 'text', text }] : [],
});

export default () => {
  const [value, setValue] = React.useState(buildTextValue());

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button onClick={() => setValue(buildTextValue('请总结重点'))}>
        写入模板
      </Button>

      <Xsender
        value={value}
        onChange={(nextValue) => setValue(nextValue)}
        onSubmit={(nextValue) => console.log(nextValue)}
      />
    </Space>
  );
};
```

## actionRef

```jsx
/**
 * title: actionRef 操作
 */
import React, { useRef } from 'react';
import { Button, Space } from 'antd';
import { Xsender } from 'fintech/x';

export default () => {
  const actionRef = useRef(null);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space wrap>
        <Button
          onClick={() => {
            actionRef.current?.insertEntity(
              {
                id: 'region-shenzhen',
                entityType: 'metadata_filter',
                key: 'region',
                value: '深圳',
                label: '深圳',
                serializeText: '/region=深圳',
              },
              { appendSpace: true },
            );
          }}
        >
          插入筛选
        </Button>

        <Button onClick={() => actionRef.current?.insertText('请总结重点')}>
          插入文本
        </Button>

        <Button onClick={() => actionRef.current?.clear()}>清空</Button>
      </Space>

      <Xsender actionRef={actionRef} onSubmit={(value) => console.log(value)} />
    </Space>
  );
};
```

| 方法                              | 说明                                            |
| :-------------------------------- | :---------------------------------------------- |
| `focus(options)`                  | 聚焦输入框                                      |
| `blur()`                          | 失焦                                            |
| `getValue()`                      | 获取当前结构化值                                |
| `clear()`                         | 清空输入                                        |
| `setValue(value, options)`        | 整体替换当前值                                  |
| `insert(segments, options)`       | 插入一个或多个 segment（别名 `insertSegments`） |
| `insertText(text, options)`       | 插入纯文本                                      |
| `insertEntity(entity, options)`   | 插入结构化 entity                               |
| `removeEntity(entityId, options)` | 删除指定 entity                                 |
| `clearHistory()`                  | 清空输入历史                                    |
| `resetDraft()`                    | 清空草稿并重置输入框                            |

## 草稿与历史

`Xsender` 的草稿和历史都基于结构化值协议。

```jsx
/**
 * title: 默认 storageSQL 接入
 */
import React, { useMemo } from 'react';
import { Xsender, createStorageSQLProviders } from 'fintech/x';

export default () => {
  const { historyProvider, draftProvider } = useMemo(() => {
    return createStorageSQLProviders({
      history: { tablePrefix: 'xsender_history', maxCount: 10, dedupe: true },
      draft: { tablePrefix: 'xsender_draft' },
    });
  }, []);

  return (
    <Xsender
      draftProvider={draftProvider}
      historyProvider={historyProvider}
      onSubmit={(value) => console.log(value)}
    />
  );
};
```

### provider 契约

```js
const draftProvider = {
  load: async () => ({ text: '', segments: [], entities: [] }),
  save: async ({ value }) => {},
  clear: async () => {},
};

const historyProvider = {
  load: async () => [
    { id: 'history-1', value: { text: '', segments: [], entities: [] } },
  ],
  save: async ({ value }) => {},
  clear: async () => {},
};
```

`draftProvider` / `historyProvider` 建议保持引用稳定，用 `useMemo` 包一层。

## 提交校验

`onSubmit` 和 `beforeSubmit` 收到的都是结构化值。

```js
<Xsender
  beforeSubmit={(value) => {
    if (!value.text.trim()) return false;

    const filters = value.entities.filter(
      (item) => item.entityType === 'metadata_filter',
    );
    if (filters.length > 3) return false;
  }}
  onSubmit={(value) => console.log(value)}
/>
```

## API

| 参数              | 说明                                         | 类型                                                    | 默认值                                           |
| :---------------- | :------------------------------------------- | :------------------------------------------------------ | :----------------------------------------------- |
| `actionRef`       | imperative API 引用                          | `React.Ref`                                             | -                                                |
| `value`           | 受控结构化值                                 | `XsenderValue`                                          | -                                                |
| `defaultValue`    | 非受控初始值                                 | `XsenderValue`                                          | 空值                                             |
| `placeholder`     | 占位文案                                     | `string`                                                | `输入内容，按 Enter 发送，输入 / 触发结构化命令` |
| `maxLength`       | 序列化文本最大长度，超长后回滚到上一次合法值 | `number`                                                | `4000`                                           |
| `entityToText`    | entity 序列化回调                            | `(entity) => string`                                    | `(e) => e.serializeText \|\| e.label`            |
| `triggers`        | trigger 配置列表                             | `TriggerConfig[]`                                       | `[]`                                             |
| `enableHistory`   | 是否启用历史浏览                             | `boolean`                                               | `true`                                           |
| `enableDraft`     | 是否启用草稿缓存                             | `boolean`                                               | `true`                                           |
| `historyProvider` | 历史 provider                                | `HistoryProvider`                                       | -                                                |
| `draftProvider`   | 草稿 provider                                | `DraftProvider`                                         | -                                                |
| `onChange`        | 值变更回调                                   | `(value, meta) => void`                                 | -                                                |
| `onSubmit`        | 提交回调                                     | `(value, context) => void`                              | -                                                |
| `beforeSubmit`    | 提交前拦截                                   | `(value, context) => boolean \| string \| Promise<...>` | -                                                |
| `onCancel`        | 取消回调                                     | `() => void`                                            | -                                                |
| `loading`         | 发送中状态                                   | `boolean`                                               | `false`                                          |
| `disabled`        | 禁用                                         | `boolean`                                               | `false`                                          |
| `header`          | 输入区顶部扩展                               | `ReactNode`                                             | -                                                |
| `footer`          | 输入区底部扩展                               | `ReactNode`                                             | -                                                |
| `suffix`          | 输入区右侧扩展                               | `ReactNode`                                             | 默认发送区                                       |

> `loading`、`disabled`、`header`、`footer`、`suffix`、`onCancel` 透传至 `@ant-design/x` Sender 组件。
