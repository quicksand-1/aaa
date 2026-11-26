---
name: 'f-form-schema'
description: '提供 FormSchema 组件的使用指南和代码示例。当用户需要使用 JSON Schema 配置方式快速生成表单时调用。'
---

# FormSchema 组件

## 功能说明

该技能帮助你使用 `fintech` 库中的 `FormSchema` 组件生成代码。`FormSchema` 是一个基于 `FormItem` 的 JSON Schema 表单配置组件，支持通过配置数组快速生成表单，适用于各种表单场景。

**重要特性**：

- 通过配置数组快速生成表单，提高开发效率
- 支持多种表单控件类型（input、select、datePicker、money 等）
- 支持表单联动和条件渲染
- 支持紧凑型表单组合
- 支持自定义组件集成
- 自动生成 placeholder，无需手动配置
- 默认 required 为 true，简化配置

## 技术实现

- 基于 React 函数组件
- 使用 fintech 组件库的 FormSchema 和 Form 组件
- 使用 Form.useForm() 创建表单实例
- 通过 items 配置数组定义表单字段
- 支持字符串、对象、函数、数组等多种 items 类型

## 组件使用

### 1. 基础用法

```jsx
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={8}
        items={[
          { name: 'eventCode', label: '事件编码' },
          { name: 'eventName', label: '事件名称' },
          { name: 'remark', label: '备注', required: false },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

### 2. 多种控件类型

```jsx
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={8}
        items={[
          '文本输入',
          { name: 'name', label: '姓名' },
          { name: 'description', label: '描述', valueType: 'textarea' },
          '数字输入',
          { name: 'age', label: '年龄', valueType: 'number' },
          { name: 'income', label: '收入', valueType: 'money' },
          '选择器',
          {
            name: 'gender',
            label: '性别',
            valueType: 'radio',
            valueEnum: { male: '男', female: '女' },
          },
          {
            name: 'hobbies',
            label: '爱好',
            valueType: 'checkbox',
            valueEnum: { reading: '阅读', sports: '运动' },
          },
          {
            name: 'city',
            label: '城市',
            valueType: 'select',
            valueEnum: { BJ: '北京', SH: '上海' },
          },
          '日期选择',
          {
            name: 'birthday',
            label: '生日',
            valueType: 'datePicker',
            format: 'YYYY-MM-DD',
          },
          {
            name: 'dateRange',
            label: '日期范围',
            valueType: 'rangePicker',
            format: 'YYYY-MM-DD',
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

### 3. 表单联动和条件渲染

```jsx
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={12}
        items={[
          {
            name: 'userType',
            label: '用户类型',
            valueType: 'select',
            valueEnum: { admin: '管理员', user: '普通用户' },
          },
          {
            name: 'hasContact',
            label: '是否有联系方式',
            valueType: 'select',
            valueEnum: { 1: '是', 0: '否' },
          },
          {
            name: 'phone',
            label: '电话',
            open: false,
          },
          {
            name: 'email',
            label: '邮箱',
            open: false,
          },
        ]}
      />
      <FormSchema
        items={[
          ({ hasContact }) =>
            hasContact === '1' && [
              {
                name: 'phone',
                label: '电话',
                open: true,
              },
              {
                name: 'email',
                label: '邮箱',
                open: true,
              },
            ],
          ({ userType }) =>
            userType === 'admin' && {
              name: 'permissions',
              label: '权限',
              valueType: 'checkbox',
              valueEnum: { read: '查看', write: '编辑', delete: '删除' },
            },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

### 4. 紧凑型表单组合

```jsx
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        items={[
          {
            colSpan: 12,
            label: '时间',
            compact: [
              {
                noStyle: true,
                name: ['time', 'timeType'],
                valueType: 'select',
                valueEnum: {
                  PAST: '基于当前往前推',
                  PREVIOUS: '上一个完整的周期',
                  POINT: '具体的时间点',
                },
              },
              {
                noStyle: true,
                name: ['time', 'timeValue'],
                valueType: 'number',
                inputProps: { precision: 0, min: 0 },
              },
            ],
          },
          {
            colSpan: 12,
            label: '默认阈值',
            compact: [
              {
                noStyle: true,
                valueType: 'select',
                valueEnum: ['>', '>=', '=', '<', '<='],
                name: 'thresholdUnit',
              },
              {
                noStyle: true,
                name: 'thresholdValue',
                valueType: 'number',
                inputProps: { precision: 0, min: 0 },
              },
            ],
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

### 5. 自定义组件集成

```jsx
import React from 'react';
import { Button, Select } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={12}
        items={[
          {
            name: 'name',
            label: '名称',
          },
          {
            name: 'category',
            label: '分类',
            children: (
              <Select
                style={{ width: '100%' }}
                options={[
                  { value: 'tech', label: '技术' },
                  { value: 'finance', label: '金融' },
                  { value: 'health', label: '健康' },
                ]}
              />
            ),
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

### 6. 字典和远程数据

```jsx
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={12}
        items={[
          {
            name: 'userType',
            label: '用户类型',
            valueType: 'dict',
            valueEnum: 'userType',
          },
          {
            name: 'country',
            label: '国家',
            valueType: 'select',
            inputProps: {
              url: '/api/countries.json',
              fields: ['code', 'name'],
            },
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

### 7. 日期限制

```jsx
import React from 'react';
import dayjs from 'dayjs';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={8}
        items={[
          {
            name: 'date',
            label: '不能选过去',
            valueType: 'datePicker',
            inputProps: {
              disabledDate: (current) => current < dayjs().startOf('day'),
            },
          },
          {
            name: 'dateFuture',
            label: '只能选未来',
            valueType: 'datePicker',
            inputProps: {
              disabledDate: (current) => current < dayjs(),
            },
          },
          {
            name: 'dateInterval',
            label: '日期区间',
            valueType: 'datePicker',
            inputProps: {
              disabledDate: (current) =>
                current > dayjs('2024-12-12') || current < dayjs('2024-10-10'),
            },
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

## 配置说明

### FormSchema 属性

| 属性     | 类型               | 必填 | 描述                              |
| -------- | ------------------ | ---- | --------------------------------- |
| items    | formitem[]         | 是   | 表单项列表                        |
| gutter   | number \| array    | 否   | 栅格间距                          |
| colSpan  | number             | 否   | 统一字段宽度                      |
| disabled | boolean            | 否   | 是否禁用所有字段                  |
| unique   | string \| string[] | 否   | 唯一编号，自动生成隐藏的 id 字段  |

### FormItem 属性

| 属性       | 类型    | 必填 | 描述                                                        |
| ---------- | ------- | ---- | ----------------------------------------------------------- |
| name       | string  | 是   | 字段名                                                      |
| label      | string  | 是   | 字段标签                                                    |
| valueType  | string  | 否   | 字段类型，默认 'input'                                      |
| required   | boolean | 否   | 是否必填，默认 true                                         |
| disabled   | boolean | 否   | 是否禁用                                                    |
| open       | boolean | 否   | 是否展示组件，false 时不展示但不隐藏                        |
| hidden     | boolean | 否   | 是否隐藏字段，隐藏的字段不参与布局但会参与表单提交          |
| placeholder | string  | 否   | 占位符，自动生成（"请输入" 或 "请选择" + label）           |
| message    | string  | 否   | 自定义校验信息，默认 '必填项'                               |
| rules      | array   | 否   | 表单验证规则                                                |
| inputProps | object  | 否   | 设置 valueType 时生效，设置子组件属性                       |
| format     | string  | 否   | 设置日期格式，默认 'YYYY-MM-DD'                             |
| valueEnum  | object  | 否   | 枚举值                                                      |
| colSpan    | number  | 否   | 栅格数，外层包裹 Row 时可用                                 |
| tooltip    | string  | 否   | 字段提示                                                    |
| extra      | string  | 否   | 额外提示信息                                                |
| children   | ReactNode | 否 | 自定义子组件                                                |
| compact    | array   | 否   | 紧凑型表单组合                                              |

### 支持的 valueType 类型

| 类型       | 原生组件               | 使用组件   | 描述                   |
| ---------- | ---------------------- | ---------- | ---------------------- |
| input      | Input                  | -          | 文本输入框             |
| number     | InputNumber            | -          | 数字输入框             |
| money      | InputNumber            | -          | 金额输入框（带格式化） |
| textarea   | Input.Textarea         | -          | 多行文本输入框         |
| switch     | Switch                 | -          | 开关                   |
| checkbox   | Checkbox               | CheckList  | 复选框                 |
| radio      | Radio                  | RadioList  | 单选框                 |
| select     | Select                 | SelectList | 下拉选择器             |
| dict       | Select                 | SelectList | 字典选择器             |
| datePicker | DatePicker             | DateQuick  | 日期选择器             |
| rangePicker| DatePicker.RangePicker | DateQuick  | 日期范围选择器         |

### items 支持的类型

| 类型           | 说明                                                      |
| -------------- | --------------------------------------------------------- |
| 字符串         | 渲染成 Divider 组件，用于分组标题                        |
| 对象           | 渲染成 FormItem 组件，支持 dataIndex 和 title 作为别名    |
| 函数           | 函数返回表单项配置，支持表单联动                          |
| 数组 (compact) | 紧凑型表单组合，使用 Space.Compact 包裹                   |
| ReactNode      | 直接渲染自定义内容                                       |

### items 使用要求

**必须使用内联方式定义 items**

FormSchema 的 items 属性**必须**在组件内部使用内联方式定义，**禁止**提取到组件外部。

**正确写法：**

```jsx
<FormSchema
  items={[
    {
      colSpan: 8,
      name: 'samplingType',
      label: '抽样场景',
      valueType: 'select',
    },
  ]}
/>
```

**错误写法：**

```jsx
// ❌ 禁止提取到组件外部
const formItems = [
  {
    colSpan: 8,
    name: 'samplingType',
    label: '抽样场景',
    valueType: 'select',
  },
];

<FormSchema items={formItems} />;
```

**原因：**

- 内联方式代码更清晰，可读性更强

## 注意事项

1. **format 参数位置**：format 参数不能写在 inputProps 中，必须直接写在 FormItem 的属性中
2. **required 默认值**：默认 required 为 true，不需要显式设置
3. **placeholder 自动生成**：placeholder 会自动生成（"请输入" 或 "请选择" + label），无需显式设置，除非有特殊需求
4. **unique vs hidden**：
   - unique 用于自动生成隐藏的唯一标识字段
   - hidden 用于隐藏字段但不参与布局，但会参与表单提交
5. **禁止使用**：不要使用 `{ name: 'id', label: 'ID', hidden: true, required: false }`，请使用 `unique={['id']}`
6. **布局优先级**：FormItem 的 colSpan 优先级高于 FormSchema 的 colSpan
7. **表单联动**：函数形式的 items 会接收当前表单值作为参数
8. **条件显示**：通过 open 属性控制表单项的显示，可以是布尔值或函数

## 最佳实践

1. **统一配置**：使用 gutter 和 colSpan 统一设置栅格布局，保持表单一致性
2. **表单联动**：使用函数形式的 items 实现表单联动，根据其他字段的值动态渲染表单项
3. **唯一编号**：使用 unique 属性自动生成隐藏的唯一标识字段，避免手动创建隐藏字段
4. **紧凑组合**：使用 compact 属性创建紧凑型表单组合，适合需要将多个字段组合在一起显示的场景
5. **禁用控制**：使用 disabled 属性统一控制表单项的禁用状态
6. **字段别名**：支持 dataIndex 和 title 作为 name 和 label 的别名，与表格 columns 配置保持一致
7. **自定义组件**：使用 children 属性自定义表单项内容，实现更复杂的表单场景
8. **类型安全**：在 TypeScript 项目中，为组件添加适当的类型定义