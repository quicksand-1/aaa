# LinkBtn 组件报告

## 组件概述

LinkBtn 是一个增强型的按钮组件，封装了 Ant Design 的 Button 和 Link 组件，支持多种按钮形态、颜色主题、加载状态、Tooltip 提示以及二次确认弹窗等功能。该组件可以替代原生的 Link 和 Button-link，提供更丰富的交互体验和更简洁的 API 设计。

### 核心价值

- **统一 API 设计**：将 Button 和 Link 的功能融合，通过单一组件实现按钮和链接的切换
- **增强交互体验**：内置 Tooltip 提示和二次确认弹窗，减少重复代码
- **灵活的状态管理**：支持 loading、disabled 等状态，自动处理禁用和加载时的交互
- **可配置性强**：支持多种按钮形态和颜色主题，满足不同 UI 场景需求
- **条件渲染支持**：通过 open 属性控制组件显示/隐藏，替代原生 hidden

## 结构分析

### 目录结构

```
src/LinkBtn/
├── index.tsx      # 主组件文件
└── confirm.tsx    # 二次确认弹窗组件
```

### 关键文件说明

- **index.tsx**：主组件入口，负责按钮/链接的渲染逻辑、Tooltip 包装、状态管理
- **confirm.tsx**：二次确认弹窗组件，基于 Modal.confirm 实现，支持备注输入

### 依赖关系

```
LinkBtn (index.tsx)
├── React (useMemo)
├── antd (Spin, Button, Tooltip)
├── @umijs/max (Link)
└── confirm.tsx (Confirm)

LinkBtn (confirm.tsx)
├── React (cloneElement, useRef)
├── antd (Modal, Input)
└── index.tsx (LinkBtn)
```

### 数据流

**Props 输入**：

- 基本属性：variant, disabled, loading, color, to, open
- Tooltip 相关：tooltip, tooltipProps
- 确认模式相关：onOk, title, content, okText, cancelText, remark, placeholder, method, modalProps
- 其他：children, className, style, onClick 等

**输出**：

- 渲染 Link 组件（当 to 存在时）
- 渲染 Confirm 组件（当 onOk 存在时）
- 渲染 Button 组件（默认情况）

**渲染逻辑**：

```
props 输入
├── open = false → 返回 null
├── to 存在 → 渲染 Link 组件（带 Tooltip）
├── onOk 存在 → 渲染 Confirm 组件（带 Tooltip）
└── 默认 → 渲染 Button 组件（带 Tooltip）
```

## 核心功能

### 1. 按钮形态切换

支持多种按钮形态，通过 variant 属性控制，当 variant 为 'link' 时自动移除 padding。

```tsx
const style = useMemo(() => {
  if (variant === 'link') {
    return { padding: 0 };
  }
}, [variant]);
```

### 2. 链接跳转功能

当提供 to 属性时，自动渲染为 Link 组件，实现页面跳转。

```tsx
if (to) {
  return wrapWithTooltip(<Link to={to} {...rest} />);
}
```

### 3. 二次确认弹窗

通过 onOk 属性触发 Confirm 组件，支持备注输入，适用于删除等危险操作。

```tsx
if (rest.onOk) {
  return wrapWithTooltip(<Confirm {...props} />);
}
```

### 4. Tooltip 包装

为按钮或链接添加 Tooltip 提示功能，支持自定义位置和样式。

```tsx
const wrapWithTooltip = (component: React.ReactNode) => {
  if (tooltip) {
    return (
      <Tooltip title={tooltip} {...tooltipProps}>
        {component}
      </Tooltip>
    );
  }
  return component;
};
```

### 5. 加载状态处理

使用 Spin 组件包装内容，显示加载状态，同时禁用按钮点击。

```tsx
<Spin size="small" spinning={loading}>
  {rest.children}
</Spin>
```

### 6. 条件渲染

通过 open 属性控制组件显示/隐藏，替代原生 hidden，更符合 React 开发模式。

```tsx
if (!open) return null;
```

### 7. 备注输入功能

Confirm 组件支持备注输入，通过 remark 属性启用，输入内容通过 onOk 回调返回。

```tsx
{
  remark && (
    <Input.TextArea
      rows={1}
      placeholder={placeholder}
      onChange={(e) => {
        inputRef.current = e.target.value;
      }}
    />
  );
}
```

### 8. 自定义 children 模式

Confirm 组件支持 method 属性，当 method 为 false 时，可以使用自定义 children。

```tsx
if (method) {
  return (
    <LinkBtn onClick={onConfirm} {...rest}>
      {children}
    </LinkBtn>
  );
}

return cloneElement(children, {
  ...rest,
  onClick: onConfirm,
});
```

## API 文档

### LinkBtnProps

| 参数         | 必填 | 类型                                                              | 默认值     | 描述                                                   | 示例                                  |
| :----------- | :--: | :---------------------------------------------------------------- | :--------- | :----------------------------------------------------- | :------------------------------------ |
| variant      |  ❌  | 'solid' \| 'outlined' \| 'dashed' \| 'filled' \| 'text' \| 'link' | 'link'     | 按钮形态                                               | `variant="solid"`                     |
| disabled     |  ❌  | boolean                                                           | false      | 设置按钮失效状态                                       | `disabled={true}`                     |
| loading      |  ❌  | boolean                                                           | false      | 设置按钮载入状态                                       | `loading={true}`                      |
| color        |  ❌  | string                                                            | 'primary'  | 按钮颜色                                               | `color="red"`                         |
| to           |  ❌  | string                                                            | -          | Link 的跳转地址                                        | `to="/home"`                          |
| open         |  ❌  | boolean                                                           | true       | 是否可见                                               | `open={false}`                        |
| tooltip      |  ❌  | React.ReactNode                                                   | -          | 提示文本                                               | `tooltip="点击查看详情"`              |
| tooltipProps |  ❌  | any                                                               | -          | 提示框属性                                             | `tooltipProps={{ placement: 'top' }}` |
| onOk         |  ❌  | (res?: any) => void                                               | -          | 确定按钮的回调（触发 confirm 模式）                    | `onOk={() => {}}`                     |
| children     |  ❌  | React.ReactNode                                                   | -          | 按钮内容                                               | `children="删除"`                     |
| className    |  ❌  | string                                                            | -          | 自定义类名                                             | `className="custom-btn"`              |
| style        |  ❌  | React.CSSProperties                                               | -          | 自定义样式                                             | `style={{ color: 'red' }}`            |
| onClick      |  ❌  | (e: any) => void                                                  | -          | 点击事件                                               | `onClick={(e) => {}}`                 |
| target       |  ❌  | string                                                            | -          | 链接打开方式                                           | `target="_blank"`                     |
| method       |  ❌  | boolean                                                           | true       | confirm 模式：true 使用 LinkBtn，false 自定义 children | `method={false}`                      |
| remark       |  ❌  | boolean                                                           | false      | 简易输入框，可在 onOk 中获取输入内容                   | `remark={true}`                       |
| placeholder  |  ❌  | string                                                            | '备注信息' | 输入框占位符                                           | `placeholder="请输入原因"`            |

### Confirm 组件额外属性

| 参数       | 必填 | 类型       | 默认值 | 描述                 | 示例                          |
| :--------- | :--: | :--------- | :----- | :------------------- | :---------------------------- |
| title      |  ❌  | ReactNode  | -      | 提示信息的标题       | `title="确认删除"`            |
| content    |  ❌  | ReactNode  | -      | 提示信息的内容       | `content="删除后无法恢复"`    |
| okText     |  ❌  | string     | '确定' | 确认按钮的文案       | `okText="确认"`               |
| cancelText |  ❌  | string     | '取消' | 取消按钮的文案       | `cancelText="放弃"`           |
| modalProps |  ❌  | ModalProps | {}     | Modal.confirm 的属性 | `modalProps={{ width: 500 }}` |

## 使用场景

### 场景 1：基础按钮使用

最简单的按钮使用场景，默认为 link 形态，展示纯文本、纯 icon、文本+icon 三种使用方式。

```tsx
import React from 'react';
import { Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { LinkBtn } from 'fintech';

export default function Demo() {
  return (
    <Space>
      <LinkBtn>普通</LinkBtn>
      <LinkBtn disabled>disabled</LinkBtn>
      <LinkBtn loading>loading</LinkBtn>
      <LinkBtn color="red">red</LinkBtn>
      <LinkBtn color="orange">orange</LinkBtn>
      <LinkBtn color="green">green</LinkBtn>
      <LinkBtn>
        <EditOutlined />
      </LinkBtn>
      <LinkBtn disabled>
        <DeleteOutlined />
      </LinkBtn>
      <LinkBtn loading>
        <EyeOutlined />
      </LinkBtn>
      <LinkBtn>
        <EditOutlined /> 编辑
      </LinkBtn>
      <LinkBtn disabled>
        <DeleteOutlined /> 删除
      </LinkBtn>
      <LinkBtn loading>
        <EyeOutlined /> 查看
      </LinkBtn>
    </Space>
  );
}
```

### 场景 2：带颜色主题的按钮

使用不同的颜色主题来区分按钮的语义，支持 13 种预设颜色。

```tsx
import React from 'react';
import { Flex } from 'antd';
import { LinkBtn } from 'fintech';

export default function Demo() {
  return (
    <Flex gap="small" wrap>
      <LinkBtn color="primary">primary(系统主色)</LinkBtn>
      <LinkBtn color="purple">purple</LinkBtn>
      <LinkBtn color="cyan">cyan</LinkBtn>
      <LinkBtn color="green">green</LinkBtn>
      <LinkBtn color="magenta">magenta</LinkBtn>
      <LinkBtn color="pink">pink</LinkBtn>
      <LinkBtn color="red">red</LinkBtn>
      <LinkBtn color="orange">orange</LinkBtn>
      <LinkBtn color="yellow">yellow</LinkBtn>
      <LinkBtn color="volcano">volcano</LinkBtn>
      <LinkBtn color="geekblue">geekblue</LinkBtn>
      <LinkBtn color="lime">lime</LinkBtn>
      <LinkBtn color="gold">gold</LinkBtn>
    </Flex>
  );
}
```

### 场景 3：加载和禁用状态

处理异步操作时的加载状态和禁用状态，自动禁用按钮点击。

```tsx
import React, { useState } from 'react';
import { Space } from 'antd';
import { LinkBtn } from 'fintech';

export default function Demo() {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <Space>
      <LinkBtn loading={loading} onClick={handleClick}>
        加载按钮
      </LinkBtn>
      <LinkBtn disabled={disabled}>禁用按钮</LinkBtn>
    </Space>
  );
}
```

### 场景 4：二次确认弹窗

删除等危险操作需要二次确认的场景，支持带备注输入的确认框。

```tsx
import React from 'react';
import { Space, Tag } from 'antd';
import { LinkBtn } from 'fintech';

export default function Demo() {
  const handleSubmit = (input?: string) => {
    console.log('提交备注:', input);
  };

  const handleDelete = () => {
    console.log('删除操作');
  };

  return (
    <Space>
      <LinkBtn
        remark
        placeholder="额外的信息，会在 onOk 中使用"
        title="提示"
        content="确认提交该内容？"
        onOk={handleSubmit}
      >
        提交
      </LinkBtn>
      <LinkBtn
        color="red"
        title="删除"
        content="确定删除该信息？"
        onOk={handleDelete}
      >
        删除
      </LinkBtn>
      <LinkBtn
        variant="solid"
        title="提示"
        content="确认提交该内容？"
        onOk={handleSubmit}
      >
        提交
      </LinkBtn>
      <LinkBtn
        color="red"
        variant="solid"
        title="删除"
        content="确定删除该信息？"
        onOk={handleDelete}
      >
        删除
      </LinkBtn>
      <LinkBtn
        method={false}
        title="删除"
        content="确定删除该信息？"
        onOk={handleDelete}
      >
        <Tag color="error">删除</Tag>
      </LinkBtn>
    </Space>
  );
}
```

### 场景 5：Tooltip 提示

为按钮添加 Tooltip 提示信息，支持自定义位置和样式。

```tsx
import React from 'react';
import { Divider } from 'antd';
import { LinkBtn } from 'fintech';

export default function Demo() {
  return (
    <div>
      <Divider titlePlacement="start">基础 tooltip</Divider>
      <LinkBtn tooltip="这是一个普通按钮">普通按钮</LinkBtn>

      <Divider titlePlacement="start">带位置的 tooltip</Divider>
      <div style={{ display: 'flex', gap: '20px' }}>
        <LinkBtn tooltip="顶部提示" tooltipProps={{ placement: 'top' }}>
          顶部
        </LinkBtn>
        <LinkBtn tooltip="底部提示" tooltipProps={{ placement: 'bottom' }}>
          底部
        </LinkBtn>
        <LinkBtn tooltip="左侧提示" tooltipProps={{ placement: 'left' }}>
          左侧
        </LinkBtn>
        <LinkBtn tooltip="右侧提示" tooltipProps={{ placement: 'right' }}>
          右侧
        </LinkBtn>
      </div>

      <Divider titlePlacement="start">不同类型的 tooltip 按钮</Divider>
      <div style={{ display: 'flex', gap: '20px' }}>
        <LinkBtn color="red" tooltip="危险按钮">
          危险按钮
        </LinkBtn>
        <LinkBtn color="orange" tooltip="警告按钮">
          警告按钮
        </LinkBtn>
        <LinkBtn color="green" tooltip="成功按钮">
          成功按钮
        </LinkBtn>
      </div>

      <Divider titlePlacement="start">与其他功能结合</Divider>
      <div style={{ display: 'flex', gap: '20px' }}>
        <LinkBtn tooltip="跳转到详情页" to="/user/detail">
          带链接的按钮
        </LinkBtn>
        <LinkBtn
          color="red"
          tooltip="点击确认删除"
          onOk={() => console.log('删除操作')}
        >
          带确认的按钮
        </LinkBtn>
      </div>
    </div>
  );
}
```

### 场景 6：链接跳转

使用 to 属性实现页面跳转，支持 target 属性控制打开方式。

```tsx
import React from 'react';
import { Space } from 'antd';
import { LinkBtn } from 'fintech';

export default function Demo() {
  return (
    <Space>
      <LinkBtn to="/home">首页</LinkBtn>
      <LinkBtn to="/user/profile">个人中心</LinkBtn>
      <LinkBtn to="/settings" target="_blank">
        设置
      </LinkBtn>
    </Space>
  );
}
```

### 场景 7：条件渲染

通过 open 属性控制组件显示/隐藏，替代原生 hidden。

```tsx
import React, { useState } from 'react';
import { Flex } from 'antd';
import { LinkBtn, RadioList } from 'fintech';

export default function Demo() {
  const [open, setOpen] = useState(true);

  return (
    <Flex vertical gap={12}>
      <RadioList
        value={open ? '显示' : '隐藏'}
        options={['显示', '隐藏']}
        onChange={(o) => {
          setOpen(o.target.value === '显示');
        }}
      />
      <Flex gap={12}>
        <LinkBtn open={open}>普通</LinkBtn>
        <LinkBtn
          remark
          open={open}
          placeholder="额外的信息，会在 onOk 中使用"
          title="提示"
          content="确认提交该内容？"
          onOk={(input) => {
            console.log(input);
          }}
        >
          提交
        </LinkBtn>
      </Flex>
    </Flex>
  );
}
```

### 场景 8：带图标的操作

预定义操作中包含图标，增强视觉效果。

```tsx
import React from 'react';
import { Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { LinkBtn } from 'fintech';

export default function Demo() {
  return (
    <Space>
      <LinkBtn>
        <EditOutlined /> 编辑
      </LinkBtn>
      <LinkBtn color="red">
        <DeleteOutlined /> 删除
      </LinkBtn>
      <LinkBtn color="green">
        <PlusOutlined /> 添加
      </LinkBtn>
      <LinkBtn color="orange">
        <EyeOutlined /> 查看
      </LinkBtn>
    </Space>
  );
}
```

## 优化建议

### 1. TypeScript 类型安全优化

当前代码中存在 `@ts-ignore` 和 `@ts-nocheck` 注释，应该修复类型定义问题。

**问题代码**（index.tsx）：

```tsx
if (rest.onOk) {
  // @ts-ignore
  return wrapWithTooltip(<Confirm {...props} />);
}
```

**问题代码**（confirm.tsx）：

```tsx
// @ts-nocheck
export default (props: ModalBoxProps & LinkBtnProps & ButtonProps) => {
```

**优化建议**：

```tsx
// 定义 Confirm 组件的 props 类型
interface ConfirmProps extends LinkBtnProps {
  onOk: (res?: any) => void;
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  remark?: boolean;
  placeholder?: string;
  method?: boolean;
  modalProps?: any;
}

// 在 index.tsx 中使用明确的类型
if (rest.onOk) {
  return wrapWithTooltip(<Confirm {...(props as ConfirmProps)} />);
}

// 在 confirm.tsx 中移除 @ts-nocheck
export default (props: ConfirmProps) => {
  // ...
};
```

### 2. 性能优化 - 避免不必要的重新渲染

当前 `wrapWithTooltip` 函数在每次渲染时都会创建新的函数，可以使用 `useCallback` 优化。

**问题代码**：

```tsx
const wrapWithTooltip = (component: React.ReactNode) => {
  if (tooltip) {
    return (
      <Tooltip title={tooltip} {...tooltipProps}>
        {component}
      </Tooltip>
    );
  }
  return component;
};
```

**优化建议**：

```tsx
const wrapWithTooltip = useCallback(
  (component: React.ReactNode) => {
    if (tooltip) {
      return (
        <Tooltip title={tooltip} {...tooltipProps}>
          {component}
        </Tooltip>
      );
    }
    return component;
  },
  [tooltip, tooltipProps],
);
```

### 3. 代码可读性优化 - 提取常量

将魔法字符串提取为常量，提高代码可维护性。

**问题代码**：

```tsx
const style = useMemo(() => {
  if (variant === 'link') {
    return { padding: 0 };
  }
}, [variant]);
```

**优化建议**：

```tsx
const LINK_VARIANT = 'link';
const DEFAULT_PADDING = 0;

const style = useMemo(() => {
  if (variant === LINK_VARIANT) {
    return { padding: DEFAULT_PADDING };
  }
}, [variant]);
```

### 4. 错误处理优化

添加错误边界处理，防止组件渲染失败导致整个页面崩溃。

**优化建议**：

```tsx
const LinkBtn = (props: LinkBtnProps) => {
  try {
    const {
      variant = 'link',
      disabled = false,
      loading = false,
      color = 'primary',
      to,
      open = true,
      tooltip,
      tooltipProps,
      ...rest
    } = props;

    const style = useMemo(() => {
      if (variant === 'link') {
        return { padding: 0 };
      }
    }, [variant]);

    if (!open) return null;

    const wrapWithTooltip = useCallback(
      (component: React.ReactNode) => {
        if (tooltip) {
          return (
            <Tooltip title={tooltip} {...tooltipProps}>
              {component}
            </Tooltip>
          );
        }
        return component;
      },
      [tooltip, tooltipProps],
    );

    if (to) {
      return wrapWithTooltip(<Link to={to} {...rest} />);
    }

    if (rest.onOk) {
      return wrapWithTooltip(<Confirm {...(props as ConfirmProps)} />);
    }

    const button = (
      <Button
        variant={variant}
        color={color as any}
        disabled={disabled || loading}
        {...rest}
        style={{ ...style, ...rest.style }}
      >
        <Spin size="small" spinning={loading}>
          {rest.children}
        </Spin>
      </Button>
    );

    return wrapWithTooltip(button);
  } catch (error) {
    console.error('LinkBtn render error:', error);
    return null;
  }
};
```

### 5. 可访问性优化

添加 ARIA 属性，提高组件的可访问性。

**优化建议**：

```tsx
const button = (
  <Button
    variant={variant}
    color={color as any}
    disabled={disabled || loading}
    aria-disabled={disabled || loading}
    aria-busy={loading}
    {...rest}
    style={{ ...style, ...rest.style }}
  >
    <Spin size="small" spinning={loading}>
      {rest.children}
    </Spin>
  </Button>
);
```

### 6. 事件处理优化

Confirm 组件中的 onConfirm 函数应该使用 useCallback 优化，避免每次渲染都创建新的函数。

**问题代码**：

```tsx
const onConfirm = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  Modal.confirm({
    // ...
  });
};
```

**优化建议**：

```tsx
import { useCallback } from 'react';

const onConfirm = useCallback(
  (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    Modal.confirm({
      title,
      content: (
        <>
          <p>{content}</p>
          {remark && (
            <Input.TextArea
              rows={1}
              placeholder={placeholder}
              onChange={(e) => {
                inputRef.current = e.target.value;
              }}
            />
          )}
        </>
      ),
      okText,
      cancelText,
      onOk: () => onOk(inputRef.current),
      afterClose: () => {
        inputRef.current = '';
      },
      ...modalProps,
    });
  },
  [title, content, remark, placeholder, okText, cancelText, onOk, modalProps],
);
```

### 7. 测试覆盖率优化

添加单元测试和集成测试，确保组件在各种场景下正常工作。

**优化建议**：

```tsx
// LinkBtn.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LinkBtn from './index';

describe('LinkBtn', () => {
  it('should render button correctly', () => {
    render(<LinkBtn>Click me</LinkBtn>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render link when to prop is provided', () => {
    render(<LinkBtn to="/home">Home</LinkBtn>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/home');
  });

  it('should show loading state', () => {
    render(<LinkBtn loading={true}>Loading</LinkBtn>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should hide when open is false', () => {
    const { container } = render(<LinkBtn open={false}>Hidden</LinkBtn>);
    expect(container.firstChild).toBeNull();
  });

  it('should render with tooltip', () => {
    render(<LinkBtn tooltip="Tooltip text">Button</LinkBtn>);
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('should render confirm modal when onOk is provided', () => {
    const mockOnOk = jest.fn();
    render(<LinkBtn onOk={mockOnOk}>Delete</LinkBtn>);
    fireEvent.click(screen.getByText('Delete'));
  });
});
```

### 8. 代码风格优化

遵循代码风格管理规则，将短属性放在前面，长属性放在后面。

**问题代码**：

```tsx
const {
  variant = 'link',
  disabled = false,
  loading = false,
  color = 'primary',
  to,
  open = true,
  tooltip,
  tooltipProps,
  ...rest
} = props;
```

**优化建议**：

```tsx
const {
  to,
  open = true,
  tooltip,
  variant = 'link',
  color = 'primary',
  disabled = false,
  loading = false,
  tooltipProps,
  ...rest
} = props;
```

## 总结

### 技术亮点

- **统一 API 设计**：将 Button 和 Link 的功能融合，通过单一组件实现按钮和链接的切换，简化了开发者的使用成本
- **增强交互体验**：内置 Tooltip 提示和二次确认弹窗，减少重复代码，提高开发效率
- **灵活的状态管理**：支持 loading、disabled 等状态，自动处理禁用和加载时的交互，提升用户体验
- **可配置性强**：支持多种按钮形态和颜色主题，满足不同 UI 场景需求
- **条件渲染支持**：通过 open 属性控制组件显示/隐藏，替代原生 hidden，更符合 React 开发模式

### 适用边界

- 适用于需要按钮和链接切换的场景
- 适用于需要二次确认的危险操作场景
- 适用于需要 Tooltip 提示的按钮场景
- 不适用于需要复杂自定义样式的按钮（建议直接使用 Ant Design Button）
- 不适用于需要复杂自定义逻辑的链接（建议直接使用 @umijs/max Link）

### 下一步建议

1. 修复 TypeScript 类型定义问题，移除 `@ts-ignore` 和 `@ts-nocheck` 注释
2. 添加单元测试和集成测试，提高代码质量和稳定性
3. 优化性能，使用 `useCallback` 和 `useMemo` 减少不必要的重新渲染
4. 提高可访问性，添加 ARIA 属性
5. 添加错误边界处理，提高组件的健壮性
6. 考虑添加更多按钮形态和颜色主题，满足更多 UI 场景需求
7. 遵循代码风格管理规则，优化属性排序
