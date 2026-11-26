---
name: 'f-drawer-form'
description: '生成抽屉式表单组件，支持新增和编辑功能。当用户需要为项目添加基于抽屉的表单交互时调用。'
---

# 抽屉式表单组件

## 功能说明

该技能生成一个基于 Ant Design 和 fintech 组件库的抽屉式表单组件，支持以下功能：

- 新增数据
- 编辑现有数据
- 表单验证
- 加载状态管理
- 操作成功提示
- 表格数据自动刷新

## 技术实现

- 使用 React 函数组件
- 基于 fintech 组件库的 DrawerBox 和 FormSchema 组件
- 使用 antd 的 message 组件进行操作提示
- 使用 useRef 和 useState 管理组件状态
- 使用 cloneElement 包装子组件，添加点击事件
- 组件内部处理业务逻辑，如 API 请求、表单配置等，无需父组件传入

## 组件创建

### 组件结构

根据业务复杂度，选择合适的组件结构：

**简单业务场景**（组件内部无复杂业务需要抽离）：

```
└── EditDrawer.jsx  # 直接使用单个文件实现
```

**复杂业务场景**（组件内部有复杂业务需要抽离成独立组件）：

```
└── EditDrawer
    └── index.jsx  # 组件实现文件
```

### 组件实现

根据选择的组件结构，在对应的文件中实现抽屉式表单组件：

```jsx
import React, { useRef, cloneElement, useState } from 'react';
import { message } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';

export default ({ children, data, tableRef, ...rest }) => {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const wrappedChild = cloneElement(children, {
    ...rest,
    onClick: () => {
      drawerRef.current?.open(true);
    },
  });

  return (
    <>
      {wrappedChild}
      <DrawerBox
        form
        title={data ? '编辑' : '新增'}
        actionRef={drawerRef}
        confirmLoading={loading}
        onOk={({ values, open }) => {
          // 根据业务需求自行配置 API 路径
          // 编辑和新增通常使用不同的接口地址
          const url = data ? '/api/items/edit' : '/api/items/add';

          request(url, {
            setLoading,
            method: data ? 'PUT' : 'POST',
            data: values,
          }).then(() => {
            tableRef.current?.reload();
            open(false);
            message.success(data ? '编辑成功' : '新增成功');
          });
        }}
        afterOpen={({ form }) => {
          if (!!data) {
            form.setFieldsValue(data);
          }
        }}
      >
        <FormSchema
          unique="id"
          items={[
            { name: 'name', label: '名称' },
            { name: 'description', label: '描述', valueType: 'textarea' },
            // 可根据实际业务需求添加更多字段
          ]}
        />
      </DrawerBox>
    </>
  );
};
```

## 配置说明

### 组件内部配置

EditDrawer 组件内部需要根据业务需求自行配置以下内容：

| 配置项    | 类型   | 描述                    |
| --------- | ------ | ----------------------- |
| editUrl   | String | 编辑操作的 API 请求路径 |
| addUrl    | String | 新增操作的 API 请求路径 |
| formItems | Array  | 表单字段配置            |
| title     | String | 抽屉标题                |

### 组件使用

EditDrawer 组件使用时需要传递以下属性：

| 属性     | 类型      | 必填 | 描述                   |
| -------- | --------- | ---- | ---------------------- |
| children | ReactNode | 是   | 触发抽屉打开的子组件   |
| data     | Object    | 否   | 编辑模式下的数据       |
| tableRef | Object    | 是   | 用于刷新表格数据的引用 |

### 表单字段配置

| 配置项     | 类型    | 必填 | 描述                                                        |
| ---------- | ------- | ---- | ----------------------------------------------------------- |
| name       | String  | 是   | 字段名                                                      |
| label      | String  | 是   | 字段标签                                                    |
| valueType  | String  | 否   | 字段类型，如 'textarea'、'select'、'datePicker'、'money' 等 |
| required   | Boolean | 否   | 是否必填，默认 true                                         |
| inputProps | Object  | 否   | 输入组件的属性                                              |
| rules      | Array   | 否   | 表单验证规则                                                |

**注意**：FormSchema 组件内部已经自动处理了 placeholder 的展示，无需在业务代码中额外配置 placeholder 属性。

### 常用 valueType 类型

| 类型       | 描述           |
| ---------- | -------------- |
| datePicker | 日期选择器     |
| money      | 金额输入框     |
| textarea   | 多行文本输入框 |
| select     | 下拉选择器     |
| radio      | 单选按钮组     |
| checkbox   | 复选框         |

## 注意事项

1. 确保已正确导入 fintech 组件库
2. 确保 actionRef 正确传递，以便操作后刷新数据
3. 确保后端 API 接口符合预期格式
4. 可根据实际需求调整表单字段和验证规则

## 扩展建议

- 添加表单验证规则
- 自定义表单字段组件
- 添加权限控制
- 优化错误处理机制
- 添加表单数据预处理和后处理逻辑

## 改进案例

### SyncDrawer 组件改进

#### 错误写法

```jsx
import React, { useRef } from 'react';
import { DrawerBox, FormSchema } from 'fintech';

export default ({ actionRef, children }) => {
  const drawerRef = useRef(null);

  const formSchema = {
    method: 'POST',
    url: '/fundPackage/syncFundPackage.json',
    labelWidth: 100,
    onOk: (values, formInstance) => {
      formInstance.validateFields().then(() => {
        drawerRef.current.open(false);
        actionRef.current?.reload();
      });
    },
    items: [
      // 表单字段配置
    ],
  };

  return (
    <>
      {children}
      <DrawerBox
        actionRef={drawerRef}
        title="项目同步"
        size={600}
        footer={['cancel', 'ok']}
        onClick={() => drawerRef.current.open(true)}
      >
        <FormSchema {...formSchema} />
      </DrawerBox>
    </>
  );
};
```

#### 正确写法

```jsx
import React, { useState, useRef, cloneElement } from 'react';
import { message } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';

export default (props) => {
  const { children, actionRef, ...rest } = props;

  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const wrappedChild = cloneElement(children, {
    ...rest,
    onClick: () => {
      drawerRef.current?.open(true);
    },
  });

  return (
    <>
      {wrappedChild}
      <DrawerBox
        form
        actionRef={drawerRef}
        title="项目同步"
        size={600}
        confirmLoading={loading}
        onOk={({ values, open }) => {
          request('/fundPackage/syncFundPackage.json', {
            setLoading,
            method: 'POST',
            data: values,
          }).then(() => {
            actionRef.current?.reload();
            open(false);
            message.success('同步成功');
          });
        }}
      >
        <FormSchema
          labelWidth={100}
          items={
            [
              // 表单字段配置
            ]
          }
        />
      </DrawerBox>
    </>
  );
};
```

#### 改进原因

1. **子组件包装**：使用 `cloneElement` 包装子组件，统一添加点击事件，避免在多个地方重复编写打开抽屉的逻辑。

2. **加载状态管理**：添加 `loading` 状态，通过 `confirmLoading` 属性传递给 `DrawerBox`，提供更好的用户体验。

3. **API 请求处理**：使用 fintech 的 `request` 函数处理 API 请求，自动管理加载状态，简化代码。

4. **操作成功提示**：添加 `message.success` 提示，增强用户反馈。

5. **参数解构**：使用 `props` 解构，提高代码可读性和可维护性。

6. **DrawerBox 配置**：使用 `form` 属性启用表单模式，自动处理表单验证和数据收集。

7. **错误处理**：`request` 函数会自动处理错误，无需手动添加 try-catch 块。

#### 最佳实践建议

1. **统一模式**：所有抽屉式表单组件应遵循相同的实现模式，确保代码一致性。

2. **状态管理**：使用 `useState` 管理加载状态，提供更好的用户体验。

3. **API 调用**：使用 fintech 的 `request` 函数处理 API 请求，简化代码并统一错误处理。

4. **用户反馈**：操作完成后添加适当的提示信息，增强用户体验。

5. **权限控制**：对于需要权限的操作，使用 `Permission.Access` 组件进行控制。

6. **代码组织**：将组件逻辑与 UI 分离，提高代码可读性和可维护性。

7. **参数传递**：使用解构赋值处理 props，提高代码可读性。

8. **类型安全**：在 TypeScript 项目中，为组件添加适当的类型定义。
