# AsyncSwitch 组件报告

## 组件概述

AsyncSwitch 是一个异步开关组件，封装了 Ant Design 的 Switch 组件，使其具有异步请求能力。当开关状态改变时，会发送异步请求到指定的 URL，并在请求成功后更新开关状态。该组件支持前置校验、加载状态显示、成功回调等功能，适用于需要异步更新状态的场景，如启用/禁用功能、开启/关闭服务等。

### 核心价值

- **异步请求能力**：封装了开关切换时的异步请求逻辑，简化开发
- **加载状态管理**：自动管理请求期间的加载状态，提升用户体验
- **前置校验支持**：通过 beforeChange 回调支持切换前的校验和确认
- **灵活的字段映射**：支持自定义字段名和枚举值，适应不同的后端接口
- **成功回调机制**：请求成功后执行回调函数，便于后续操作

## 结构分析

### 目录结构

```
src/AsyncSwitch/
└── index.tsx      # 主组件文件
```

### 关键文件说明

- **index.tsx**：主组件入口，负责异步开关的渲染和逻辑处理

### 依赖关系

```
AsyncSwitch (index.tsx)
├── React (useState, useEffect)
├── antd (Switch)
└── request (自定义请求工具)
```

### 数据流

**Props 输入**：

- url: string - 请求地址
- name: string - 字段名
- nameEnum: [boolean | string, boolean | string] - 字段枚举值
- params: Record<string, any> - 额外参数
- defaultChecked: boolean - 默认选中状态
- onOk: (bool: boolean, res: any) => void - 成功回调
- beforeChange: (bool: boolean) => Record<string, any> | Promise<Record<string, any>> | false | Promise<false> | void | Promise<void> - 切换前回调

**State 管理**：

- checked: boolean - 开关状态
- loading: boolean - 加载状态

**输出**：

- 渲染 Switch 组件，包含加载状态和异步切换逻辑

**数据流**：

```
props 输入
├── 初始化：设置 checked 为 defaultChecked
└── 用户切换开关
    ├── 调用 beforeChange（如果存在）
    │   ├── 返回 false → 阻止切换
    │   └── 返回对象 → 合并到请求数据中
    ├── 发送异步请求
    │   ├── 请求中 → 设置 loading 为 true
    │   └── 请求成功 → 更新 checked，调用 onOk
    └── 请求失败 → 保持原状态
```

## 核心功能

### 1. 异步请求处理

开关切换时发送异步请求到指定的 URL。

```tsx
request(url, {
  setLoading,
  method: 'POST',
  data,
}).then((res) => {
  setChecked(bool);
  onOk(bool, res);
});
```

### 2. 加载状态管理

请求期间自动管理加载状态，防止重复操作。

```tsx
const [loading, setLoading] = useState(false);

<Switch
  loading={loading}
  checked={checked}
  onChange={async (bool) => {
    request(url, {
      setLoading,
      method: 'POST',
      data,
    }).then((res) => {
      setChecked(bool);
      onOk(bool, res);
    });
  }}
/>;
```

### 3. 前置校验支持

通过 beforeChange 回调支持切换前的校验和确认。

```tsx
onChange={async (bool) => {
  let beforeChangeResult: Record<string, any> = {};
  if (props.beforeChange) {
    const result = await Promise.resolve(props.beforeChange(bool));
    if (result === false) {
      return;
    }
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      beforeChangeResult = result;
    }
  }
}}
```

### 4. 字段映射

支持自定义字段名和枚举值，适应不同的后端接口。

```tsx
const data = {
  ...(name ? { ...params, [name]: nameEnum[bool ? 1 : 0] } : params),
  ...beforeChangeResult,
};
```

### 5. 成功回调

请求成功后执行回调函数，便于后续操作。

```tsx
request(url, {
  setLoading,
  method: 'POST',
  data,
}).then((res) => {
  setChecked(bool);
  onOk(bool, res);
});
```

## API 文档

### AsyncSwitchProps

| 参数           | 必填 | 类型                                                                                                                       | 默认值        | 描述                                                                    | 示例                                                          |
| :------------- | :--: | :------------------------------------------------------------------------------------------------------------------------- | :------------ | :---------------------------------------------------------------------- | :------------------------------------------------------------ |
| url            |  ✅  | string                                                                                                                     | -             | 请求地址，默认是 POST 请求                                              | `url="/api/switch"`                                           |
| name           |  ❌  | string \| null                                                                                                             | status        | 字段名，如不需要可设置成 null                                           | `name="isEff"`                                                |
| nameEnum       |  ❌  | [boolean \| string, boolean \| string]                                                                                     | [false, true] | 字段名枚举，第一个元素对应关闭状态，第二个元素对应开启状态              | `nameEnum={['STOP', 'START']}`                                |
| params         |  ❌  | Record<string, any>                                                                                                        | {}            | request 额外参数                                                        | `params={{ id: 1 }}`                                          |
| defaultChecked |  ❌  | boolean                                                                                                                    | false         | 默认是否选中                                                            | `defaultChecked={true}`                                       |
| beforeChange   |  ❌  | (bool: boolean) => Record<string, any> \| Promise<Record<string, any>> \| false \| Promise<false> \| void \| Promise<void> | -             | 切换前的回调函数，返回 false 可阻止切换；返回对象会合并到请求的 data 中 | `beforeChange={(checked) => { if (!checked) return false; }}` |
| onOk           |  ❌  | (bool: boolean, res: any) => void                                                                                          | () => {}      | 异步请求成功后的回调函数                                                | `onOk={(checked, res) => { console.log(res); }}`              |

### Switch Props 继承

AsyncSwitch 继承了 Ant Design Switch 组件的所有属性，包括但不限于：

| 参数              | 类型                 | 默认值    | 描述           |
| :---------------- | :------------------- | :-------- | :------------- |
| size              | 'default' \| 'small' | 'default' | 开关大小       |
| checkedChildren   | ReactNode            | -         | 选中时的内容   |
| unCheckedChildren | ReactNode            | -         | 非选中时的内容 |
| disabled          | boolean              | false     | 是否禁用       |
| className         | string               | -         | 类名           |
| style             | CSSProperties        | -         | 样式           |

## 使用场景

### 场景 1：基础用法

最简单的使用方式，传入 url 和 name 即可。

```tsx
import React from 'react';
import { message } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  return (
    <AsyncSwitch
      name="status"
      defaultChecked={false}
      url="/api/switch"
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
}
```

### 场景 2：自定义字段枚举

使用自定义的字段枚举值，适应不同的后端接口。

```tsx
import React from 'react';
import { message } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  return (
    <AsyncSwitch
      name="isEff"
      nameEnum={['STOP', 'START']}
      size="medium"
      checkedChildren="开"
      unCheckedChildren="关"
      defaultChecked={false}
      url="/api/switch"
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
}
```

### 场景 3：异步 beforeChange

在切换前进行异步确认操作。

```tsx
import React from 'react';
import { message, Modal } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  return (
    <AsyncSwitch
      name="isEff"
      nameEnum={['STOP', 'START']}
      size="medium"
      checkedChildren="开"
      unCheckedChildren="关"
      defaultChecked={false}
      url="/api/switch"
      beforeChange={(checked) => {
        return new Promise((resolve) => {
          Modal.confirm({
            title: '确认操作',
            content: `确定要${checked ? '打开' : '关闭'}吗？`,
            onOk: async () => {
              message.info('已确认，开始执行操作...');
              try {
                const res = await fetch(`https://randomuser.me/api`).then(
                  (res) => res.json(),
                );
                resolve({
                  total: res.info.results,
                  list: res.results,
                });
              } catch (error) {
                resolve(false);
              }
            },
            onCancel: () => {
              message.warning('已取消操作');
              resolve(false);
            },
          });
        });
      }}
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
}
```

### 场景 4：同步 beforeChange

在切换前进行同步校验。

```tsx
import React from 'react';
import { message } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  const [canSwitch, setCanSwitch] = React.useState(true);

  return (
    <AsyncSwitch
      name="status"
      defaultChecked={false}
      url="/api/switch"
      beforeChange={(checked) => {
        if (!checked && !canSwitch) {
          message.warning('当前不允许关闭');
          return false;
        }
        return { userId: 123 };
      }}
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
}
```

### 场景 5：表单填写场景

在表单中使用，结合表单数据一起提交。

```tsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  const [form] = Form.useForm();

  return (
    <div>
      <Form form={form}>
        <Form.Item name="name" label="名称">
          <Input />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <AsyncSwitch
            name="status"
            defaultChecked={false}
            url="/api/switch"
            params={{ id: 1 }}
            onOk={(checked) => {
              message.success(`已${checked ? '打开' : '关闭'}`);
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
```

### 场景 6：批量操作

在表格中使用，支持批量切换。

```tsx
import React from 'react';
import { Table, message } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <AsyncSwitch
          name="status"
          nameEnum={[0, 1]}
          defaultChecked={status === 1}
          url="/api/switch"
          params={{ id: record.id }}
          onOk={(checked) => {
            message.success(`已${checked ? '打开' : '关闭'} ${record.name}`);
          }}
        />
      ),
    },
  ];

  const data = [
    { id: 1, name: '项目1', status: 1 },
    { id: 2, name: '项目2', status: 0 },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
}
```

### 场景 7：带额外参数

在请求中携带额外的参数。

```tsx
import React from 'react';
import { message } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  return (
    <AsyncSwitch
      name="status"
      defaultChecked={false}
      url="/api/switch"
      params={{
        id: 1,
        type: 'project',
        userId: 123,
      }}
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
}
```

### 场景 8：错误处理

处理请求失败的情况。

```tsx
import React from 'react';
import { message } from 'antd';
import AsyncSwitch from '@/AsyncSwitch';

export default function Demo() {
  return (
    <AsyncSwitch
      name="status"
      defaultChecked={false}
      url="/api/switch"
      onOk={(checked, res) => {
        if (res.code === 200) {
          message.success(`已${checked ? '打开' : '关闭'}`);
        } else {
          message.error(res.message);
        }
      }}
    />
  );
}
```

## 优化建议

### 1. 错误处理优化

添加请求失败时的错误处理，提供更好的用户体验。

**问题代码**：

```tsx
request(url, {
  setLoading,
  method: 'POST',
  data,
}).then((res) => {
  setChecked(bool);
  onOk(bool, res);
});
```

**优化建议**：

```tsx
request(url, {
  setLoading,
  method: 'POST',
  data,
})
  .then((res) => {
    setChecked(bool);
    onOk(bool, res);
  })
  .catch((error) => {
    console.error('Switch change failed:', error);
    message.error('操作失败，请重试');
  });
```

### 2. TypeScript 类型定义优化

完善 TypeScript 类型定义，提高类型安全性。

**问题代码**：

```tsx
type AsyncSwitchProps = {
  url: string;
  name: string;
  nameEnum: [boolean | string, boolean | string];
  params?: Record<string, any>;
  defaultChecked?: boolean;
  onOk?: (bool: boolean, res: any) => void;
  beforeChange?: (
    bool: boolean,
  ) =>
    | Record<string, any>
    | Promise<Record<string, any>>
    | false
    | Promise<false>
    | void
    | Promise<void>;
};
```

**优化建议**：

```tsx
type NameEnumValue = boolean | string;

interface AsyncSwitchProps
  extends Omit<
    React.ComponentProps<typeof Switch>,
    'onChange' | 'checked' | 'loading'
  > {
  url: string;
  name?: string | null;
  nameEnum?: [NameEnumValue, NameEnumValue];
  params?: Record<string, any>;
  defaultChecked?: boolean;
  onOk?: (checked: boolean, res: any) => void;
  beforeChange?: (
    checked: boolean,
  ) =>
    | Record<string, any>
    | Promise<Record<string, any>>
    | false
    | Promise<false>
    | void
    | Promise<void>;
}
```

### 3. 性能优化 - 使用 useCallback

使用 useCallback 优化 onChange 函数，减少不必要的重新渲染。

**优化建议**：

```tsx
import { useState, useEffect, useCallback } from 'react';

export default (props: AsyncSwitchProps) => {
  const {
    url,
    name = 'status',
    nameEnum = [false, true],
    params = {},
    defaultChecked = false,
    onOk = () => {},
    beforeChange,
    ...rest
  } = props;

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  const handleChange = useCallback(
    async (bool: boolean) => {
      let beforeChangeResult: Record<string, any> = {};
      if (beforeChange) {
        const result = await Promise.resolve(beforeChange(bool));
        if (result === false) {
          return;
        }
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          beforeChangeResult = result;
        }
      }

      const data = {
        ...(name ? { ...params, [name]: nameEnum[bool ? 1 : 0] } : params),
        ...beforeChangeResult,
      };
      request(url, {
        setLoading,
        method: 'POST',
        data,
      })
        .then((res) => {
          setChecked(bool);
          onOk(bool, res);
        })
        .catch((error) => {
          console.error('Switch change failed:', error);
        });
    },
    [url, name, nameEnum, params, beforeChange, onOk],
  );

  return (
    <Switch
      size="small"
      loading={loading}
      checked={checked}
      onChange={handleChange}
      {...rest}
    />
  );
};
```

### 4. 添加 onError 回调

添加请求失败时的回调函数，便于处理错误。

**优化建议**：

```tsx
interface AsyncSwitchProps
  extends Omit<
    React.ComponentProps<typeof Switch>,
    'onChange' | 'checked' | 'loading'
  > {
  url: string;
  name?: string | null;
  nameEnum?: [NameEnumValue, NameEnumValue];
  params?: Record<string, any>;
  defaultChecked?: boolean;
  onOk?: (checked: boolean, res: any) => void;
  onError?: (error: any) => void;
  beforeChange?: (
    checked: boolean,
  ) =>
    | Record<string, any>
    | Promise<Record<string, any>>
    | false
    | Promise<false>
    | void
    | Promise<void>;
}

export default (props: AsyncSwitchProps) => {
  const {
    url,
    name = 'status',
    nameEnum = [false, true],
    params = {},
    defaultChecked = false,
    onOk = () => {},
    onError = () => {},
    beforeChange,
    ...rest
  } = props;

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  const handleChange = useCallback(
    async (bool: boolean) => {
      let beforeChangeResult: Record<string, any> = {};
      if (beforeChange) {
        const result = await Promise.resolve(beforeChange(bool));
        if (result === false) {
          return;
        }
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          beforeChangeResult = result;
        }
      }

      const data = {
        ...(name ? { ...params, [name]: nameEnum[bool ? 1 : 0] } : params),
        ...beforeChangeResult,
      };
      request(url, {
        setLoading,
        method: 'POST',
        data,
      })
        .then((res) => {
          setChecked(bool);
          onOk(bool, res);
        })
        .catch((error) => {
          onError(error);
        });
    },
    [url, name, nameEnum, params, beforeChange, onOk, onError],
  );

  return (
    <Switch
      size="small"
      loading={loading}
      checked={checked}
      onChange={handleChange}
      {...rest}
    />
  );
};
```

### 5. 添加请求方法配置

允许自定义请求方法，支持 GET、POST 等。

**优化建议**：

```tsx
interface AsyncSwitchProps
  extends Omit<
    React.ComponentProps<typeof Switch>,
    'onChange' | 'checked' | 'loading'
  > {
  url: string;
  name?: string | null;
  nameEnum?: [NameEnumValue, NameEnumValue];
  params?: Record<string, any>;
  defaultChecked?: boolean;
  onOk?: (checked: boolean, res: any) => void;
  onError?: (error: any) => void;
  beforeChange?: (
    checked: boolean,
  ) =>
    | Record<string, any>
    | Promise<Record<string, any>>
    | false
    | Promise<false>
    | void
    | Promise<void>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export default (props: AsyncSwitchProps) => {
  const {
    url,
    name = 'status',
    nameEnum = [false, true],
    params = {},
    defaultChecked = false,
    onOk = () => {},
    onError = () => {},
    beforeChange,
    method = 'POST',
    ...rest
  } = props;

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  const handleChange = useCallback(
    async (bool: boolean) => {
      let beforeChangeResult: Record<string, any> = {};
      if (beforeChange) {
        const result = await Promise.resolve(beforeChange(bool));
        if (result === false) {
          return;
        }
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          beforeChangeResult = result;
        }
      }

      const data = {
        ...(name ? { ...params, [name]: nameEnum[bool ? 1 : 0] } : params),
        ...beforeChangeResult,
      };
      request(url, {
        setLoading,
        method,
        data,
      })
        .then((res) => {
          setChecked(bool);
          onOk(bool, res);
        })
        .catch((error) => {
          onError(error);
        });
    },
    [url, name, nameEnum, params, beforeChange, onOk, onError, method],
  );

  return (
    <Switch
      size="small"
      loading={loading}
      checked={checked}
      onChange={handleChange}
      {...rest}
    />
  );
};
```

### 6. 可访问性优化

添加 ARIA 属性，提高组件的可访问性。

**优化建议**：

```tsx
return (
  <Switch
    size="small"
    loading={loading}
    checked={checked}
    onChange={handleChange}
    aria-label={rest['aria-label'] || '开关'}
    {...rest}
  />
);
```

### 7. 测试覆盖率优化

添加单元测试，确保组件在各种场景下正常工作。

**优化建议**：

```tsx
// AsyncSwitch.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AsyncSwitch from './index';
import request from '../fetch/request';

jest.mock('../fetch/request');

describe('AsyncSwitch', () => {
  it('should render switch correctly', () => {
    render(<AsyncSwitch url="/api/switch" name="status" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should call request on change', async () => {
    request.mockResolvedValue({ code: 200 });
    render(<AsyncSwitch url="/api/switch" name="status" onOk={jest.fn()} />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    await waitFor(() => {
      expect(request).toHaveBeenCalled();
    });
  });

  it('should call beforeChange on change', async () => {
    const beforeChange = jest.fn().mockResolvedValue(false);
    render(
      <AsyncSwitch
        url="/api/switch"
        name="status"
        beforeChange={beforeChange}
      />,
    );
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    await waitFor(() => {
      expect(beforeChange).toHaveBeenCalled();
    });
  });

  it('should not call request when beforeChange returns false', async () => {
    const beforeChange = jest.fn().mockResolvedValue(false);
    render(
      <AsyncSwitch
        url="/api/switch"
        name="status"
        beforeChange={beforeChange}
      />,
    );
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    await waitFor(() => {
      expect(request).not.toHaveBeenCalled();
    });
  });
});
```

### 8. 添加防抖功能

防止用户快速多次点击开关。

**优化建议**：

```tsx
import { useState, useEffect, useCallback, useRef } from 'react';

export default (props: AsyncSwitchProps) => {
  const {
    url,
    name = 'status',
    nameEnum = [false, true],
    params = {},
    defaultChecked = false,
    onOk = () => {},
    onError = () => {},
    beforeChange,
    method = 'POST',
    debounceTime = 300,
    ...rest
  } = props;

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastClickTime = useRef(0);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  const handleChange = useCallback(
    async (bool: boolean) => {
      const now = Date.now();
      if (now - lastClickTime.current < debounceTime) {
        return;
      }
      lastClickTime.current = now;

      let beforeChangeResult: Record<string, any> = {};
      if (beforeChange) {
        const result = await Promise.resolve(beforeChange(bool));
        if (result === false) {
          return;
        }
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          beforeChangeResult = result;
        }
      }

      const data = {
        ...(name ? { ...params, [name]: nameEnum[bool ? 1 : 0] } : params),
        ...beforeChangeResult,
      };
      request(url, {
        setLoading,
        method,
        data,
      })
        .then((res) => {
          setChecked(bool);
          onOk(bool, res);
        })
        .catch((error) => {
          onError(error);
        });
    },
    [
      url,
      name,
      nameEnum,
      params,
      beforeChange,
      onOk,
      onError,
      method,
      debounceTime,
    ],
  );

  return (
    <Switch
      size="small"
      loading={loading}
      checked={checked}
      onChange={handleChange}
      aria-label={rest['aria-label'] || '开关'}
      {...rest}
    />
  );
};
```

## 总结

### 技术亮点

- **异步请求能力**：封装了开关切换时的异步请求逻辑，简化开发
- **加载状态管理**：自动管理请求期间的加载状态，提升用户体验
- **前置校验支持**：通过 beforeChange 回调支持切换前的校验和确认
- **灵活的字段映射**：支持自定义字段名和枚举值，适应不同的后端接口
- **成功回调机制**：请求成功后执行回调函数，便于后续操作
- **轻量级实现**：代码简洁，无复杂逻辑，易于理解和维护

### 适用边界

- 适用于需要异步更新状态的场景，如启用/禁用功能、开启/关闭服务
- 适用于需要前置校验或确认的开关操作
- 适用于需要携带额外参数的请求场景
- 适用于表格操作列、表单操作区等需要动态渲染开关的场景
- 不适用于需要复杂交互逻辑的开关操作（建议直接在父组件中处理）
- 不适用于需要实时同步的场景（请求是异步的）

### 下一步建议

1. 添加请求失败时的错误处理，提供更好的用户体验
2. 完善 TypeScript 类型定义，提高类型安全性
3. 使用 useCallback 优化 onChange 函数，减少不必要的重新渲染
4. 添加 onError 回调，便于处理请求失败的情况
5. 添加请求方法配置，支持 GET、POST、PUT、DELETE 等
6. 添加可访问性支持，如 ARIA 属性
7. 添加单元测试和集成测试，确保组件在各种场景下正常工作
8. 添加防抖功能，防止用户快速多次点击开关
9. 考虑添加更多的配置选项，如请求超时时间、重试次数等
10. 考虑添加请求拦截器和响应拦截器，便于统一处理请求和响应
