# Chronobreak 组件报告

## 组件概述

Chronobreak 是一个表单数据缓存和回显组件，用于提取上一次填写的数据并快速恢复到表单中。该组件通过本地存储（storageSQL）实现数据的持久化，当检测到用户之前填写过表单时，显示回显按钮，点击后自动填充表单字段，提升用户体验和填写效率。

### 核心价值

- **数据持久化**：自动保存表单数据到本地存储，避免数据丢失
- **智能回显**：检测历史数据并提示用户恢复，减少重复输入
- **灵活定制**：支持自定义按钮或使用默认样式
- **简单易用**：通过 id 和 form 两个参数即可实现功能
- **自动清理**：回显后自动清空历史数据，避免重复填充

## 结构分析

### 目录结构

```
src/Chronobreak/
└── index.tsx      # 主组件文件
```

### 关键文件说明

- **index.tsx**：主组件入口，负责数据存储、回显逻辑和按钮渲染

### 依赖关系

```
Chronobreak (index.tsx)
├── React (useState, cloneElement)
├── antd (Button, Tooltip)
└── storageSQL (本地存储工具)
```

### 数据流

**Props 输入**：

- form: Form 实例对象
- id: 唯一标识
- tooltip: 提示文本
- children: 自定义子元素
- ...rest: 其他 Button 属性

**State 管理**：

- data: 从 storage 获取的历史数据

**输出**：

- 渲染 Tooltip 包装的回显按钮（当存在历史数据时）
- 返回 null（当不存在历史数据时）

**数据流**：

```
props 输入
├── 初始化：从 storage 获取历史数据
├── 判断：是否存在历史数据
│   ├── 存在 → 渲染回显按钮
│   │   └── 点击 → 填充表单 → 清空历史数据
│   └── 不存在 → 返回 null
```

## 核心功能

### 1. 数据存储管理

通过 storageSQL 工具实现数据的持久化存储和读取。

```tsx
const FROM = 'Chronobreak';

const storage = {
  get: ({ id }) => {
    return storageSQL('find', { from: FROM, where: `id=${id}` });
  },
  set: ({ id, values }) => {
    storageSQL('duplicate', {
      from: FROM,
      where: `id=${id}`,
      values: {
        v: values,
        id,
      },
    });
  },
};
```

### 2. 历史数据初始化

组件初始化时从 storage 获取历史数据。

```tsx
const [data, setData] = useState(() => {
  return storage.get({ id });
});
```

### 3. 回显按钮渲染

当存在历史数据时，渲染回显按钮，支持自定义 children 或默认按钮。

```tsx
if (data.v) {
  const onClick = () => {
    form.setFieldsValue(data.v);
    setData({});
  };

  return (
    <Tooltip title={tooltip}>
      {rest.children ? (
        cloneElement(rest.children, {
          ...rest,
          onClick,
        })
      ) : (
        <Button color="cyan" variant="solid" onClick={onClick}>
          回显
        </Button>
      )}
    </Tooltip>
  );
}

return null;
```

### 4. 表单数据填充

点击回显按钮时，将历史数据填充到表单，并清空历史数据。

```tsx
const onClick = () => {
  form.setFieldsValue(data.v);
  setData({});
};
```

### 5. 静态方法暴露

提供静态方法供外部调用，用于手动保存和获取数据。

```tsx
Chronobreak.storage = storage;
```

## API 文档

### ChronobreakProps

| 参数     | 必填 | 类型        | 默认值                                                                             | 描述                           | 示例                               |
| :------- | :--: | :---------- | :--------------------------------------------------------------------------------- | :----------------------------- | :--------------------------------- |
| id       |  ✅  | string      | -                                                                                  | 唯一标识，用于区分不同的表单   | `id="user-form"`                   |
| form     |  ✅  | Form        | -                                                                                  | 表单实例对象，用于填充数据     | `form={form}`                      |
| tooltip  |  ❌  | string      | '检测到您之前填写过此表单，点击「回显」按钮可快速恢复上次输入内容，节省您的时间。' | 提示文本                       | `tooltip="点击恢复上次填写的内容"` |
| children |  ❌  | ReactNode   | -                                                                                  | 自定义子元素，可替换默认按钮   | `<Button>自定义按钮</Button>`      |
| ...rest  |  ❌  | ButtonProps | -                                                                                  | 其他 Button 属性，会传递给按钮 | `color="primary" variant="solid"`  |

### Chronobreak.storage 静态方法

| 方法    | 参数                          | 返回值                    | 描述         | 示例                                                           |
| :------ | :---------------------------- | :------------------------ | :----------- | :------------------------------------------------------------- |
| **get** | `{ id: string }`              | `{ v: any } \| undefined` | 获取历史数据 | `Chronobreak.storage.get({ id: 'form-id' })`                   |
| **set** | `{ id: string, values: any }` | `void`                    | 保存历史数据 | `Chronobreak.storage.set({ id: 'form-id', values: formData })` |

## 使用场景

### 场景 1：基础用法

最简单的使用方式，传入 form 和 id 即可。

```tsx
import React from 'react';
import { Form, Input, Button } from 'antd';
import Chronobreak from '@/Chronobreak';

export default function Demo() {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('提交表单:', values);
    Chronobreak.storage.set({
      id: 'demo-form',
      values,
    });
  };

  return (
    <div>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="姓名">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="邮箱">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>

      <Chronobreak form={form} id="demo-form" />
    </div>
  );
}
```

### 场景 2：自定义提示文本

自定义 tooltip 提示文本，提供更友好的用户提示。

```tsx
import React from 'react';
import { Form, Input } from 'antd';
import Chronobreak from '@/Chronobreak';

export default function Demo() {
  const [form] = Form.useForm();

  return (
    <div>
      <Form form={form}>
        <Form.Item name="name" label="姓名">
          <Input />
        </Form.Item>
      </Form>

      <Chronobreak
        form={form}
        id="demo-form"
        tooltip="检测到您上次填写过此表单，点击按钮可快速恢复"
      />
    </div>
  );
}
```

### 场景 3：自定义按钮样式

使用自定义 children 替换默认按钮，实现个性化样式。

```tsx
import React from 'react';
import { Form, Input, Button } from 'antd';
import Chronobreak from '@/Chronobreak';

export default function Demo() {
  const [form] = Form.useForm();

  return (
    <div>
      <Form form={form}>
        <Form.Item name="name" label="姓名">
          <Input />
        </Form.Item>
      </Form>

      <Chronobreak form={form} id="demo-form">
        <Button type="primary" icon={<ReloadOutlined />}>
          恢复上次填写
        </Button>
      </Chronobreak>
    </div>
  );
}
```

### 场景 4：复杂表单回显

处理复杂表单结构，包括嵌套字段和数组字段。

```tsx
import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import Chronobreak from '@/Chronobreak';

export default function Demo() {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('提交表单:', values);
    Chronobreak.storage.set({
      id: 'complex-form',
      values,
    });
  };

  return (
    <div>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="姓名">
          <Input />
        </Form.Item>
        <Form.Item name="age" label="年龄">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="city" label="城市">
          <Select
            options={[
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
              { label: '广州', value: 'guangzhou' },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>

      <Chronobreak form={form} id="complex-form" />
    </div>
  );
}
```

### 场景 5：手动保存数据

在表单提交成功后，手动调用 storage.set 保存数据。

```tsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import Chronobreak from '@/Chronobreak';

export default function Demo() {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await submitForm(values);
      message.success('提交成功');

      Chronobreak.storage.set({
        id: 'manual-form',
        values,
      });
    } catch (error) {
      message.error('提交失败');
    }
  };

  return (
    <div>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="姓名">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>

      <Chronobreak form={form} id="manual-form" />
    </div>
  );
}
```

### 场景 6：手动获取数据

在表单初始化时，手动调用 storage.get 获取历史数据。

```tsx
import React, { useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import Chronobreak from '@/Chronobreak';

export default function Demo() {
  const [form] = Form.useForm();

  useEffect(() => {
    const historyData = Chronobreak.storage.get({
      id: 'init-form',
    });

    if (historyData?.v) {
      form.setFieldsValue(historyData.v);
    }
  }, [form]);

  const handleSubmit = (values) => {
    Chronobreak.storage.set({
      id: 'init-form',
      values,
    });
  };

  return (
    <div>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="姓名">
          <Input />
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

## 优化建议

### 1. TypeScript 类型定义优化

当前代码缺少明确的 TypeScript 类型定义，应该添加类型约束。

**问题代码**：

```tsx
const Chronobreak = ({ form, id, tooltip = '...', ...rest }) => {
```

**优化建议**：

```tsx
interface ChronobreakProps {
  form: FormInstance;
  id: string;
  tooltip?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const Chronobreak: React.FC<ChronobreakProps> = ({
  form,
  id,
  tooltip = '检测到您之前填写过此表单，点击「回显」按钮可快速恢复上次输入内容，节省您的时间。',
  children,
  ...rest
}) => {
```

### 2. 代码可读性优化

提取常量和工具函数，提高代码可维护性。

**问题代码**：

```tsx
const FROM = 'Chronobreak';

const storage = {
  get: ({ id }) => {
    return storageSQL('find', { from: FROM, where: `id=${id}` });
  },
  set: ({ id, values }) => {
    storageSQL('duplicate', {
      from: FROM,
      where: `id=${id}`,
      values: {
        v: values,
        id,
      },
    });
  },
};
```

**优化建议**：

```tsx
const STORAGE_TABLE = 'Chronobreak';

const createStorageKey = (id: string) => `id=${id}`;

const storage = {
  get: ({ id }: { id: string }) => {
    return storageSQL('find', {
      from: STORAGE_TABLE,
      where: createStorageKey(id),
    });
  },
  set: ({ id, values }: { id: string; values: any }) => {
    storageSQL('duplicate', {
      from: STORAGE_TABLE,
      where: createStorageKey(id),
      values: {
        v: values,
        id,
      },
    });
  },
};
```

### 3. 性能优化 - 使用 useCallback

onClick 函数在每次渲染时都会创建新的函数，可以使用 useCallback 优化。

**问题代码**：

```tsx
if (data.v) {
  const onClick = () => {
    form.setFieldsValue(data.v);
    setData({});
  };

  return (
    <Tooltip title={tooltip}>
      {rest.children ? (
        cloneElement(rest.children, {
          ...rest,
          onClick,
        })
      ) : (
        <Button color="cyan" variant="solid" onClick={onClick}>
          回显
        </Button>
      )}
    </Tooltip>
  );
}
```

**优化建议**：

```tsx
import { useCallback } from 'react';

const Chronobreak: React.FC<ChronobreakProps> = ({
  form,
  id,
  tooltip = '检测到您之前填写过此表单，点击「回显」按钮可快速恢复上次输入内容，节省您的时间。',
  children,
  ...rest
}) => {
  const [data, setData] = useState(() => {
    return storage.get({ id });
  });

  const handleRestore = useCallback(() => {
    form.setFieldsValue(data.v);
    setData({});
  }, [form, data.v]);

  if (data.v) {
    return (
      <Tooltip title={tooltip}>
        {children ? (
          cloneElement(children, {
            ...rest,
            onClick: handleRestore,
          })
        ) : (
          <Button color="cyan" variant="solid" onClick={handleRestore}>
            回显
          </Button>
        )}
      </Tooltip>
    );
  }

  return null;
};
```

### 4. 错误处理优化

添加错误边界处理，防止 storage 操作失败导致组件崩溃。

**优化建议**：

```tsx
const Chronobreak: React.FC<ChronobreakProps> = ({
  form,
  id,
  tooltip = '检测到您之前填写过此表单，点击「回显」按钮可快速恢复上次输入内容，节省您的时间。',
  children,
  ...rest
}) => {
  const [data, setData] = useState(() => {
    try {
      return storage.get({ id });
    } catch (error) {
      console.error('Failed to load history data:', error);
      return {};
    }
  });

  const handleRestore = useCallback(() => {
    try {
      form.setFieldsValue(data.v);
      setData({});
    } catch (error) {
      console.error('Failed to restore form data:', error);
    }
  }, [form, data.v]);

  if (data.v) {
    return (
      <Tooltip title={tooltip}>
        {children ? (
          cloneElement(children, {
            ...rest,
            onClick: handleRestore,
          })
        ) : (
          <Button color="cyan" variant="solid" onClick={handleRestore}>
            回显
          </Button>
        )}
      </Tooltip>
    );
  }

  return null;
};
```

### 5. 可访问性优化

添加 ARIA 属性，提高组件的可访问性。

**优化建议**：

```tsx
if (data.v) {
  return (
    <Tooltip title={tooltip}>
      {children ? (
        cloneElement(children, {
          ...rest,
          onClick: handleRestore,
          'aria-label': '恢复上次填写的内容',
        })
      ) : (
        <Button
          color="cyan"
          variant="solid"
          onClick={handleRestore}
          aria-label="恢复上次填写的内容"
        >
          回显
        </Button>
      )}
    </Tooltip>
  );
}
```

### 6. 测试覆盖率优化

添加单元测试，确保组件在各种场景下正常工作。

**优化建议**：

```tsx
// Chronobreak.test.tsx
import { render, screen } from '@testing-library/react';
import Chronobreak from './index';

describe('Chronobreak', () => {
  it('should render nothing when no history data', () => {
    const form = Form.useForm()[0];
    render(<Chronobreak form={form} id="test" />);
    expect(screen.queryByText('回显')).not.toBeInTheDocument();
  });

  it('should render restore button when history data exists', () => {
    Chronobreak.storage.set({ id: 'test', values: { name: 'John' } });
    const form = Form.useForm()[0];
    render(<Chronobreak form={form} id="test" />);
    expect(screen.getByText('回显')).toBeInTheDocument();
  });

  it('should restore form data on click', () => {
    Chronobreak.storage.set({ id: 'test', values: { name: 'John' } });
    const form = Form.useForm()[0];
    render(<Chronobreak form={form} id="test" />);

    const button = screen.getByText('回显');
    button.click();

    expect(form.getFieldValue('name')).toBe('John');
  });
});
```

### 7. 代码风格优化

遵循代码风格管理规则，将短属性放在前面，长属性放在后面。

**问题代码**：

```tsx
const Chronobreak = ({ form, id, tooltip = '...', ...rest }) => {
```

**优化建议**：

```tsx
const Chronobreak = ({
  id,
  form,
  tooltip = '检测到您之前填写过此表单，点击「回显」按钮可快速恢复上次输入内容，节省您的时间。',
  children,
  ...rest
}) => {
```

## 总结

### 技术亮点

- **数据持久化**：通过 storageSQL 实现本地存储，避免数据丢失
- **智能回显**：自动检测历史数据并提示用户恢复，提升用户体验
- **灵活定制**：支持自定义按钮样式和提示文本，满足不同场景需求
- **自动清理**：回显后自动清空历史数据，避免重复填充
- **简单易用**：通过 id 和 form 两个参数即可实现功能，降低使用成本

### 适用边界

- 适用于需要保存表单历史数据的场景
- 适用于需要快速恢复表单数据的场景
- 适用于表单填写频繁、数据重复性高的场景
- 不适用于需要实时同步的场景（storageSQL 是本地存储）
- 不适用于需要多设备同步的场景（本地存储无法跨设备）

### 下一步建议

1. 添加明确的 TypeScript 类型定义，提高类型安全性
2. 使用 useCallback 优化 onClick 函数，减少不必要的重新渲染
3. 添加错误边界处理，提高组件的健壮性
4. 添加可访问性支持，如 ARIA 属性
5. 添加单元测试和集成测试，确保组件在各种场景下正常工作
6. 考虑添加更多配置选项，如自动保存间隔、数据过期时间等
7. 考虑添加数据加密功能，保护敏感信息
