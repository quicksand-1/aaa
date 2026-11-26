# AsyncTree 组件报告

## 组件概述

AsyncTree 是一个异步树形组件，封装了 Ant Design 的 Tree 组件，使其具有异步请求能力。该组件支持从远程 URL 加载树形数据，并提供数据缓存、字段映射、数据格式化等功能。组件自动管理加载状态，支持选中状态的双向绑定，适用于需要异步加载树形数据的场景，如组织架构选择、权限配置、分类管理等。

### 核心价值

- **异步加载能力**：封装了树形数据的异步请求逻辑，简化开发
- **加载状态管理**：自动管理请求期间的加载状态，提升用户体验
- **数据缓存支持**：支持数据缓存，避免重复请求，提高性能
- **灵活的字段映射**：支持自定义字段映射，适应不同的后端接口
- **数据格式化**：支持自定义数据格式化函数，灵活处理响应数据

## 结构分析

### 目录结构

```
src/AsyncTree/
└── index.tsx      # 主组件文件
```

### 关键文件说明

- **index.tsx**：主组件入口，负责异步树形数据的加载和渲染

### 依赖关系

```
AsyncTree (index.tsx)
├── React (useState, useEffect)
├── antd (Tree, Spin)
├── _typeOf (类型判断工具)
└── cacheRequest (缓存请求工具)
```

### 数据流

**Props 输入**：

- value: any - 选中的节点
- onChange: (ks: any, e: any) => void - 选中变化回调
- fields: [string, string, string] - 字段映射
- url: string - 请求地址
- dataPath: string - 数据路径
- cache: boolean - 是否缓存
- params: Record<string, any> - 请求参数
- formatData: (res: any) => any - 数据格式化函数

**State 管理**：

- loading: boolean - 加载状态
- data: any[] - 树形数据

**输出**：

- 渲染 Spin 包裹的 Tree 组件

**数据流**：

```
props 输入
├── 初始化：调用 query() 请求数据
│   ├── 如果开启 cache → 使用缓存请求
│   └── 如果未开启 cache → 直接请求
├── 请求中 → 设置 loading 为 true
├── 请求成功 → 格式化数据 → 更新 data
└── 用户选中节点
    ├── 判断 ks 类型（Array 或 Object）
    ├── Array → 调用 onChange(ks, e)
    └── Object → 调用 onChange(ks.checked, ks, e)
```

## 核心功能

### 1. 异步数据加载

从远程 URL 加载树形数据。

```tsx
const query = () => {
  if (!url) return;

  cacheRequest(url, {
    cache,
    params,
    dataPath,
    setLoading,
  }).then((res: any) => {
    const d = formatData ? formatData(res) : res;
    setData(d);
  });
};
```

### 2. 加载状态管理

请求期间自动管理加载状态。

```tsx
const [loading, setLoading] = useState(false);

<Spin spinning={loading}>
  <Tree {...rest} />
</Spin>;
```

### 3. 数据缓存

支持数据缓存，避免重复请求。

```tsx
cacheRequest(url, {
  cache,
  params,
  dataPath,
  setLoading,
});
```

### 4. 字段映射

支持自定义字段映射，适应不同的后端接口。

```tsx
fieldNames={{
  key: fields[0],
  title: fields[1],
  children: fields[2],
}}
```

### 5. 数据格式化

支持自定义数据格式化函数。

```tsx
const d = formatData ? formatData(res) : res;
setData(d);
```

### 6. 选中状态管理

支持选中状态的双向绑定，兼容不同的返回格式。

```tsx
onCheck={(ks: any, e) => {
  if (_typeOf(ks, 'Array')) {
    onChange(ks, e)
  } else if (_typeOf(ks, 'Object')) {
    onChange(ks.checked, ks, e)
  }
}}
```

## API 文档

### AsyncTreeProps

| 参数       | 必填 | 类型                      | 默认值                       | 描述                                               | 示例                                         |
| :--------- | :--: | :------------------------ | :--------------------------- | :------------------------------------------------- | :------------------------------------------- |
| value      |  ❌  | any                       | -                            | 选中的节点                                         | `value={keys}`                               |
| onChange   |  ❌  | (ks: any, e: any) => void | -                            | 选中变化回调                                       | `onChange={(ks, e) => { console.log(ks); }}` |
| fields     |  ❌  | [string, string, string]  | ['key', 'title', 'children'] | 字段映射，分别对应 key、title、children            | `fields={['id', 'name', 'subItems']}`        |
| url        |  ❌  | string                    | ''                           | 请求地址，默认是 GET 请求                          | `url="/api/tree"`                            |
| dataPath   |  ❌  | string                    | -                            | 数据路径，用于从响应中提取数据                     | `dataPath="data.list"`                       |
| cache      |  ❌  | boolean                   | false                        | 延迟缓存加载，通常用于某个页面有多个相同请求的组件 | `cache={true}`                               |
| params     |  ❌  | Record<string, any>       | {}                           | request 额外参数                                   | `params={{ type: 'org' }}`                   |
| formatData |  ❌  | (res: any) => any         | -                            | 数据格式化函数                                     | `formatData={(res) => res.data}`             |

### Tree Props 继承

AsyncTree 组件继承了 Ant Design Tree 组件的所有属性，包括但不限于：

| 参数                | 类型          | 默认值 | 描述                     |
| :------------------ | :------------ | :----- | :----------------------- |
| checkable           | boolean       | true   | 是否显示复选框           |
| showLine            | boolean       | false  | 是否显示连接线           |
| showIcon            | boolean       | false  | 是否显示图标             |
| selectable          | boolean       | true   | 是否可选中               |
| multiple            | boolean       | false  | 是否支持多选             |
| checkStrictly       | boolean       | false  | 父子节点选中状态不再关联 |
| defaultExpandAll    | boolean       | false  | 默认展开所有节点         |
| defaultExpandedKeys | string[]      | []     | 默认展开的节点           |
| className           | string        | -      | 类名                     |
| style               | CSSProperties | -      | 样式                     |

## 使用场景

### 场景 1：基础用法

最简单的使用方式，传入 url 即可。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      onChange={(a, b, c) => {
        console.log(a);
        setKeys(a);
      }}
    />
  );
}
```

### 场景 2：自定义字段映射

使用自定义的字段映射，适应不同的后端接口。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      fields={['id', 'name', 'children']}
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

### 场景 3：数据格式化

使用 formatData 函数格式化响应数据。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      formatData={(res) => {
        return res.data.list.map((item) => ({
          key: item.id,
          title: item.name,
          children: item.subItems,
        }));
      }}
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

### 场景 4：数据缓存

开启数据缓存，避免重复请求。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      cache={true}
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

### 场景 5：数据路径提取

使用 dataPath 从响应中提取数据。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      dataPath="data.result"
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

### 场景 6：带参数请求

在请求中携带额外的参数。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      params={{
        type: 'org',
        status: 'active',
      }}
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

### 场景 7：表单集成

在表单中使用，结合表单数据一起提交。

```tsx
import React from 'react';
import { Form, Input, Button } from 'antd';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('提交表单:', values);
  };

  return (
    <div>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="名称">
          <Input />
        </Form.Item>
        <Form.Item name="treeKeys" label="树形选择">
          <AsyncTree
            showLine
            url="/api/tree"
            onChange={(ks) => {
              form.setFieldValue('treeKeys', ks);
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
```

### 场景 8：多选模式

支持多选模式，获取多个选中的节点。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState([]);

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      multiple={true}
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

### 场景 9：默认展开所有节点

设置默认展开所有节点。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      defaultExpandAll={true}
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

### 场景 10：父子节点独立选中

设置父子节点选中状态不再关联。

```tsx
import React, { useState } from 'react';
import AsyncTree from '@/AsyncTree';

export default function Demo() {
  const [keys, setKeys] = useState([]);

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/api/tree"
      checkStrictly={true}
      onChange={(ks) => {
        setKeys(ks);
      }}
    />
  );
}
```

## 优化建议

### 1. TypeScript 类型定义优化

为组件添加明确的 TypeScript 类型定义，提高类型安全性。

**问题代码**：

```tsx
export default (props: any) => {
```

**优化建议**：

```tsx
interface AsyncTreeProps extends Omit<React.ComponentProps<typeof Tree>, 'onCheck' | 'treeData' | 'checkedKeys'> {
  value?: any;
  onChange?: (ks: any, e: any) => void;
  fields?: [string, string, string];
  url?: string;
  dataPath?: string;
  cache?: boolean;
  params?: Record<string, any>;
  formatData?: (res: any) => any;
}

export default (props: AsyncTreeProps) => {
```

### 2. 性能优化 - 使用 useMemo

使用 useMemo 优化 fieldNames 和 treeData，减少不必要的重新渲染。

**优化建议**：

```tsx
import { useState, useEffect, useMemo } from 'react';

export default (props: AsyncTreeProps) => {
  const {
    value,
    onChange,
    fields = ['key', 'title', 'children'],
    url = '',
    dataPath,
    cache = false,
    params = {},
    formatData,
    ...rest
  } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fieldNames = useMemo(
    () => ({
      key: fields[0],
      title: fields[1],
      children: fields[2],
    }),
    [fields],
  );

  const treeData = useMemo(() => {
    return data?.length > 0 ? data : rest.treeData;
  }, [data, rest.treeData]);

  return (
    <Spin spinning={loading}>
      <Tree
        checkable
        checkedKeys={value}
        onCheck={(ks: any, e) => {
          if (_typeOf(ks, 'Array')) {
            onChange(ks, e);
          } else if (_typeOf(ks, 'Object')) {
            onChange(ks.checked, ks, e);
          }
        }}
        fieldNames={fieldNames}
        {...rest}
        treeData={treeData}
      />
    </Spin>
  );
};
```

### 3. 错误处理优化

添加请求失败时的错误处理，提供更好的用户体验。

**问题代码**：

```tsx
cacheRequest(url, {
  cache,
  params,
  dataPath,
  setLoading,
}).then((res: any) => {
  const d = formatData ? formatData(res) : res;
  setData(d);
});
```

**优化建议**：

```tsx
cacheRequest(url, {
  cache,
  params,
  dataPath,
  setLoading,
})
  .then((res: any) => {
    const d = formatData ? formatData(res) : res;
    setData(d);
  })
  .catch((error) => {
    console.error('Failed to load tree data:', error);
    message.error('加载树形数据失败，请重试');
  });
```

### 4. 添加 onError 回调

添加请求失败时的回调函数，便于处理错误。

**优化建议**：

```tsx
interface AsyncTreeProps
  extends Omit<
    React.ComponentProps<typeof Tree>,
    'onCheck' | 'treeData' | 'checkedKeys'
  > {
  value?: any;
  onChange?: (ks: any, e: any) => void;
  fields?: [string, string, string];
  url?: string;
  dataPath?: string;
  cache?: boolean;
  params?: Record<string, any>;
  formatData?: (res: any) => any;
  onError?: (error: any) => void;
}

export default (props: AsyncTreeProps) => {
  const {
    value,
    onChange,
    fields = ['key', 'title', 'children'],
    url = '',
    dataPath,
    cache = false,
    params = {},
    formatData,
    onError = () => {},
    ...rest
  } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const query = () => {
    if (!url) return;

    cacheRequest(url, {
      cache,
      params,
      dataPath,
      setLoading,
    })
      .then((res: any) => {
        const d = formatData ? formatData(res) : res;
        setData(d);
      })
      .catch((error) => {
        onError(error);
      });
  };

  useEffect(() => {
    query();
  }, []);

  return (
    <Spin spinning={loading}>
      <Tree
        checkable
        checkedKeys={value}
        onCheck={(ks: any, e) => {
          if (_typeOf(ks, 'Array')) {
            onChange(ks, e);
          } else if (_typeOf(ks, 'Object')) {
            onChange(ks.checked, ks, e);
          }
        }}
        fieldNames={{
          key: fields[0],
          title: fields[1],
          children: fields[2],
        }}
        {...rest}
        treeData={data?.length > 0 ? data : rest.treeData}
      />
    </Spin>
  );
};
```

### 5. 添加空状态处理

添加空状态处理，提供更好的用户体验。

**优化建议**：

```tsx
import { Empty } from 'antd';

return (
  <Spin spinning={loading}>
    {data?.length > 0 || rest.treeData ? (
      <Tree
        checkable
        checkedKeys={value}
        onCheck={(ks: any, e) => {
          if (_typeOf(ks, 'Array')) {
            onChange(ks, e);
          } else if (_typeOf(ks, 'Object')) {
            onChange(ks.checked, ks, e);
          }
        }}
        fieldNames={{
          key: fields[0],
          title: fields[1],
          children: fields[2],
        }}
        {...rest}
        treeData={data?.length > 0 ? data : rest.treeData}
      />
    ) : (
      <Empty description="暂无数据" />
    )}
  </Spin>
);
```

### 6. 可访问性优化

添加 ARIA 属性，提高组件的可访问性。

**优化建议**：

```tsx
return (
  <Spin spinning={loading}>
    <Tree
      checkable
      checkedKeys={value}
      onCheck={(ks: any, e) => {
        if (_typeOf(ks, 'Array')) {
          onChange(ks, e);
        } else if (_typeOf(ks, 'Object')) {
          onChange(ks.checked, ks, e);
        }
      }}
      fieldNames={{
        key: fields[0],
        title: fields[1],
        children: fields[2],
      }}
      aria-label={rest['aria-label'] || '树形选择'}
      {...rest}
      treeData={data?.length > 0 ? data : rest.treeData}
    />
  </Spin>
);
```

### 7. 测试覆盖率优化

添加单元测试，确保组件在各种场景下正常工作。

**优化建议**：

```tsx
// AsyncTree.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import AsyncTree from './index';
import cacheRequest from '../fetch/cacheRequest';

jest.mock('../fetch/cacheRequest');

describe('AsyncTree', () => {
  it('should render tree correctly', () => {
    cacheRequest.mockResolvedValue([
      { key: '1', title: 'Node 1', children: [] },
    ]);
    render(<AsyncTree url="/api/tree" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('should call cacheRequest on mount', async () => {
    cacheRequest.mockResolvedValue([
      { key: '1', title: 'Node 1', children: [] },
    ]);
    render(<AsyncTree url="/api/tree" />);
    await waitFor(() => {
      expect(cacheRequest).toHaveBeenCalled();
    });
  });

  it('should call onChange on check', async () => {
    const onChange = jest.fn();
    cacheRequest.mockResolvedValue([
      { key: '1', title: 'Node 1', children: [] },
    ]);
    render(<AsyncTree url="/api/tree" onChange={onChange} />);
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      checkbox.click();
      expect(onChange).toHaveBeenCalled();
    });
  });
});
```

### 8. 添加防抖功能

防止用户快速多次点击节点。

**优化建议**：

```tsx
import { useState, useEffect, useRef } from 'react';

export default (props: AsyncTreeProps) => {
  const {
    value,
    onChange,
    fields = ['key', 'title', 'children'],
    url = '',
    dataPath,
    cache = false,
    params = {},
    formatData,
    onError = () => {},
    debounceTime = 300,
    ...rest
  } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const lastCheckTime = useRef(0);

  const query = () => {
    if (!url) return;

    cacheRequest(url, {
      cache,
      params,
      dataPath,
      setLoading,
    })
      .then((res: any) => {
        const d = formatData ? formatData(res) : res;
        setData(d);
      })
      .catch((error) => {
        onError(error);
      });
  };

  useEffect(() => {
    query();
  }, []);

  const handleCheck = (ks: any, e: any) => {
    const now = Date.now();
    if (now - lastCheckTime.current < debounceTime) {
      return;
    }
    lastCheckTime.current = now;

    if (_typeOf(ks, 'Array')) {
      onChange(ks, e);
    } else if (_typeOf(ks, 'Object')) {
      onChange(ks.checked, ks, e);
    }
  };

  return (
    <Spin spinning={loading}>
      <Tree
        checkable
        checkedKeys={value}
        onCheck={handleCheck}
        fieldNames={{
          key: fields[0],
          title: fields[1],
          children: fields[2],
        }}
        {...rest}
        treeData={data?.length > 0 ? data : rest.treeData}
      />
    </Spin>
  );
};
```

## 总结

### 技术亮点

- **异步加载能力**：封装了树形数据的异步请求逻辑，简化开发
- **加载状态管理**：自动管理请求期间的加载状态，提升用户体验
- **数据缓存支持**：支持数据缓存，避免重复请求，提高性能
- **灵活的字段映射**：支持自定义字段映射，适应不同的后端接口
- **数据格式化**：支持自定义数据格式化函数，灵活处理响应数据
- **选中状态管理**：支持选中状态的双向绑定，兼容不同的返回格式
- **轻量级实现**：代码简洁，无复杂逻辑，易于理解和维护

### 适用边界

- 适用于需要异步加载树形数据的场景，如组织架构选择、权限配置、分类管理
- 适用于需要数据缓存的场景，避免重复请求
- 适用于需要自定义字段映射的场景，适应不同的后端接口
- 适用于表单操作区、配置页面等需要动态渲染树形数据的场景
- 不适用于需要实时同步的场景（请求是异步的）
- 不适用于需要复杂交互逻辑的树形操作（建议直接在父组件中处理）

### 下一步建议

1. 添加明确的 TypeScript 类型定义，提高类型安全性
2. 使用 useMemo 优化 fieldNames 和 treeData，减少不必要的重新渲染
3. 添加请求失败时的错误处理，提供更好的用户体验
4. 添加 onError 回调，便于处理请求失败的情况
5. 添加空状态处理，提供更好的用户体验
6. 添加可访问性支持，如 ARIA 属性
7. 添加单元测试和集成测试，确保组件在各种场景下正常工作
8. 添加防抖功能，防止用户快速多次点击节点
9. 考虑添加更多的配置选项，如请求超时时间、重试次数等
10. 考虑添加请求拦截器和响应拦截器，便于统一处理请求和响应
