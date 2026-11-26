---
name: 'AsyncSwitch'
description: 'Generates code examples for AsyncSwitch component. Invoke when user wants to create test cases or usage examples for the AsyncSwitch component.'
---

# AsyncSwitch

这个技能帮助你使用 `fintech` 库中的 `AsyncSwitch` 组件生成代码。`AsyncSwitch` 是 Ant Design `Switch` 组件的包装器，添加了异步请求功能，适用于需要在开关切换时发送请求的场景。

## 使用方法

该技能可以生成 `AsyncSwitch` 组件在不同场景下的使用代码，包括：

### 1. 基础用法

**生成代码**：

```jsx
import React from 'react';
import { AsyncSwitch } from 'fintech';

const Demo = () => {
  return (
    <div>
      <AsyncSwitch
        url="/api/switch"
        name="status"
        defaultChecked={false}
        onOk={(checked) => {
          console.log('开关状态已更改:', checked);
        }}
      />
    </div>
  );
};

export default Demo;
```

### 2. 异步验证场景

**生成代码**：

```jsx
import React from 'react';
import { AsyncSwitch } from 'fintech';

const Demo = () => {
  return (
    <div>
      <AsyncSwitch
        url="/api/switch"
        name="status"
        defaultChecked={false}
        beforeChange={async (checked) => {
          // 模拟异步验证
          return new Promise((resolve) => {
            setTimeout(() => {
              if (checked) {
                resolve({ extraParam: 'value' });
              } else {
                resolve(false); // 阻止关闭
              }
            }, 1000);
          });
        }}
        onOk={(checked) => {
          console.log('开关状态已更改:', checked);
        }}
      />
    </div>
  );
};

export default Demo;
```

### 3. 同步验证场景

**生成代码**：

```jsx
import React from 'react';
import { AsyncSwitch } from 'fintech';

const Demo = () => {
  return (
    <div>
      <AsyncSwitch
        url="/api/switch"
        name="status"
        defaultChecked={false}
        beforeChange={(checked) => {
          // 模拟同步验证
          if (checked) {
            return { extraParam: 'value' };
          } else {
            return false; // 阻止关闭
          }
        }}
        onOk={(checked) => {
          console.log('开关状态已更改:', checked);
        }}
      />
    </div>
  );
};

export default Demo;
```

## 组件 API

`AsyncSwitch` 组件支持以下属性：

| 参数             | 说明                                                                    | 类型                                                                                             | 默认值        |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| `url`            | 请求地址，默认是 POST 请求                                              | string                                                                                           | -             |
| `name`           | 字段名，如不需要可设置成 null                                           | string \| null                                                                                   | "status"      |
| `nameEnum`       | 字段名枚举                                                              | [boolean \| string, boolean \| string]                                                           | [false, true] |
| `params`         | request 额外参数                                                        | object                                                                                           | {}            |
| `defaultChecked` | 默认是否选中                                                            | boolean                                                                                          | false         |
| `beforeChange`   | 切换前的回调函数，返回 false 可阻止切换；返回对象会合并到请求的 data 中 | function(checked): object \| Promise<object> \| false \| Promise<false> \| void \| Promise<void> | -             |
| `onOk`           | 异步请求成功后的回调函数                                                | function(checked, res)                                                                           | -             |

## 何时使用此技能

当你需要：

- 快速生成 `AsyncSwitch` 组件的使用代码
- 了解 `AsyncSwitch` 组件在不同场景下的应用
- 为项目添加带有异步请求功能的开关组件

此技能将帮助你快速上手并正确使用 `fintech` 库中的 `AsyncSwitch` 组件，提高开发效率。

## 参考文档（相对路径）

- **组件文档**：[docs/components/AsyncSwitch.md](docs/components/AsyncSwitch.md)
- **组件源码**：[src/AsyncSwitch/index.tsx](src/AsyncSwitch/index.tsx)
- **组件分析报告**：[document/AsyncSwitch/README.md](document/AsyncSwitch/README.md)
