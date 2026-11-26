---
name: 'SelectList'
description: '提供 SelectList 组件的使用指南和代码示例。Invoke when user needs to use SelectList component for data selection, especially with features like multiple data formats, async loading, dictionary integration, and advanced search.'
---

# SelectList

这个技能帮助你使用 `fintech` 库中的 `SelectList` 组件生成代码。`SelectList` 是一个封装了 antd Select 组件的增强型选择列表组件，支持多种数据格式、异步数据加载、字典数据集成等功能，适用于各种数据选择场景。

## 使用方法

该技能可以生成 `SelectList` 组件在不同场景下的使用代码，包括：

### 1. 基础用法

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      options={{ CHINA: '中国', USA: '美国' }}
      placeholder="对象映射格式"
    />
    <SelectList options={['中国', '美国']} placeholder="字符串数组格式" />
    <SelectList
      options={[
        { name: '中国', key: 'CHINA' },
        { name: '美国', key: 'USA' },
      ]}
      fields={['key', 'name']}
      placeholder="自定义字段映射"
    />
  </div>
);
```

### 2. 本地搜索

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      options={[
        { code: 'CHINA', name: '中国' },
        { code: 'USA', name: '美国' },
        { code: 'JAPAN', name: '日本' },
      ]}
      fields={['code', 'name']}
      localSearch
      placeholder="支持本地搜索"
    />
    <SelectList
      options={[
        { code: 'CHINA', name: '中国' },
        { code: 'USA', name: '美国' },
      ]}
      fields={['code', 'name']}
      localSearch
      filterSymbol={['_', '/', '-', ' ']}
      placeholder="自定义过滤符号"
    />
  </div>
);
```

### 3. 额外选项

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      options={[
        { code: 'CHINA', name: '中国' },
        { code: 'USA', name: '美国' },
      ]}
      extraOptions={[{ code: 'OTHER', name: '其他国家' }]}
      fields={['code', 'name']}
      placeholder="带额外选项"
    />
  </div>
);
```

### 4. 自定义下拉框内容

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      options={[
        { code: 'CHINA', name: '中国' },
        { code: 'USA', name: '美国' },
      ]}
      fields={['code', 'name']}
      optionRender={(item) => (
        <div>
          <span>{item.label}</span>
          <span style={{ color: '#999', marginLeft: 8 }}>{item.value}</span>
        </div>
      )}
      placeholder="自定义下拉框内容"
    />
  </div>
);
```

### 5. 下拉框底部额外内容

**生成代码**：

```jsx
import React from 'react';
import { SelectList, Typography } from 'fintech';
import { Alert } from 'antd';

export default () => (
  <div>
    <SelectList
      options={[
        { code: 'CHINA', name: '中国' },
        { code: 'USA', name: '美国' },
      ]}
      fields={['code', 'name']}
      alert={
        <Alert
          title="提示信息"
          description="这是下拉框底部的额外内容"
          type="info"
          showIcon
        />
      }
      placeholder="带底部提示信息"
    />
  </div>
);
```

### 6. 设置跳转链接

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      options={[
        { code: 'CHINA', name: '中国' },
        { code: 'USA', name: '美国' },
      ]}
      fields={['code', 'name']}
      linkProps={{
        children: '管理国家列表',
        onClick: () => window.open('/admin/countries'),
      }}
      placeholder="带跳转链接"
    />
  </div>
);
```

### 7. 异步数据加载

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      url="/api/countries.json"
      fields={['code', 'name']}
      placeholder="默认 load 模式"
    />
    <SelectList
      url="/api/countries.json"
      trigger="focus"
      fields={['code', 'name']}
      placeholder="focus 模式"
    />
    <SelectList
      url="/api/search.json?keyword="
      trigger="search"
      fields={['code', 'name']}
      firstRequest
      placeholder="search 模式"
    />
  </div>
);
```

### 8. 缓存加载

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      url="/api/countries.json"
      fields={['code', 'name']}
      cache
      placeholder="启用缓存加载"
    />
    <SelectList
      url="/api/countries.json"
      fields={['code', 'name']}
      cache
      placeholder="多个相同请求只加载一次"
    />
  </div>
);
```

### 9. 字典数据集成

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => {
  // 使用字典 Hooks
  const { dictEnum, dictFun } = SelectList.useDict({ dictKey: 'userType' });

  return (
    <div>
      <SelectList dictKey="userType" placeholder="直接使用字典" />
      <div>字典值：{dictFun('admin')}</div>
    </div>
  );
};
```

### 10. 自定义搜索和格式化

**生成代码**：

```jsx
import React from 'react';
import { SelectList } from 'fintech';

export default () => (
  <div>
    <SelectList
      url="/api/search"
      trigger="search"
      fields={['code', 'name']}
      formatData={(res) => res.data}
      searchFormat={(input) => `?keyword=${encodeURIComponent(input)}`}
      placeholder="自定义搜索和格式化"
    />
  </div>
);
```

## 组件 API

### 基础属性

| 参数           | 说明                                        | 类型             | 默认值             |
| -------------- | ------------------------------------------- | ---------------- | ------------------ |
| `options`      | 指定可选项                                  | enum \| Option[] | -                  |
| `fields`       | 需要指定的字段                              | [code, name]     | ['value', 'label'] |
| `extraOptions` | 额外的数据源，会常驻列表中                  | enum \| Option[] | -                  |
| `alert`        | 自定义下拉框下面额外区域的内容              | ReactNode        | -                  |
| `linkProps`    | LinkBtn 属性，一般用于设置跳转链接          | LinkBtnProps     | -                  |
| `localSearch`  | 是否开启本地搜索                            | boolean          | false              |
| `filterSymbol` | 需要过滤掉的符号，在 localSearch 启用时生效 | string[]         | `['_', '/', '-']`  |
| `optionRender` | 自定义选项渲染                              | function         | -                  |
| `width`        | 组件宽度                                    | string \| number | '100%'             |

### 异步属性

| 参数           | 说明                                               | 类型                          | 默认值 |
| -------------- | -------------------------------------------------- | ----------------------------- | ------ |
| `url`          | 请求地址                                           | string                        | -      |
| `params`       | 请求参数                                           | object                        | -      |
| `dataPath`     | 数据源路径，默认从 `dataObject` 中寻找             | string \| string[]            | -      |
| `trigger`      | 数据请求时机                                       | 'load' \| 'focus' \| 'search' | 'load' |
| `firstRequest` | 首次是否触发请求，search 模式下生效                | boolean                       | false  |
| `formatData`   | 数据过滤                                           | function(res)                 | -      |
| `searchFormat` | 自定义 search 时的入参                             | function(input)               | -      |
| `cache`        | 延迟缓存加载，通常用于某个页面有多个相同请求的组件 | boolean                       | false  |

### 字典属性

| 参数            | 说明                       | 类型    | 默认值 |
| --------------- | -------------------------- | ------- | ------ |
| `dictKey`       | 字典编码                   | string  | -      |
| `manualRequest` | 是否手动请求，默认自动请求 | boolean | false  |

### 静态方法

| 方法      | 说明              | 参数                         | 返回值                             |
| --------- | ----------------- | ---------------------------- | ---------------------------------- |
| `useDict` | 字典数据集成 Hook | `{ dictKey, manualRequest }` | `{ dictEnum, data, dictFun, run }` |

## 何时使用此技能

当你需要：

- 快速生成 `SelectList` 组件的使用代码
- 了解 `SelectList` 组件在不同场景下的应用
- 为项目添加支持多种数据格式的选择列表
- 实现异步数据加载或字典数据集成的选择功能
- 学习如何使用 `SelectList` 组件的高级功能

此技能将帮助你快速上手并正确使用 `fintech` 库中的 `SelectList` 组件，提高开发效率。

## 参考文档（相对路径）

- **组件文档**：[docs/components/SelectList.md](docs/components/SelectList.md)
- **组件源码**：[src/SelectList/index.tsx](src/SelectList/index.tsx)
- **组件分析报告**：[document/SelectList/README.md](document/SelectList/README.md)
