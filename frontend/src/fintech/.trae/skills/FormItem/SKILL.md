---
name: 'FormItem'
description: '提供 FormItem 组件的使用指南和代码示例。Invoke when user needs to create form fields with various control types, JSON schema configuration, and dynamic form updates.'
---

# FormItem

这个技能帮助你使用 `fintech` 库中的 `FormItem` 组件生成代码。`FormItem` 是一个封装了 antd Form.Item 的增强型表单字段组件，提供了更简洁的 API 和更丰富的功能，适用于各种表单场景。

## 使用方法

该技能优先推荐使用 `FormSchema` 来实现各种表单功能，因为它提供了更简洁、更统一的配置方式。以下是不同场景下的使用代码示例：

### 1. 基础用法（使用 FormSchema）

**生成代码**：

```jsx
import React from 'react';
import { Form } from 'antd';
import { FormSchema } from 'fintech';

export default () => (
  <Form>
    <FormSchema
      items={[
        {
          name: 'name',
          label: '姓名',
          valueType: 'input',
        },
        {
          name: 'age',
          label: '年龄',
          valueType: 'number',
        },
        {
          name: 'gender',
          label: '性别',
          valueType: 'radio',
          valueEnum: {
            male: '男',
            female: '女',
          },
        },
        {
          name: 'hobbies',
          label: '爱好',
          valueType: 'checkbox',
          valueEnum: {
            reading: '阅读',
            sports: '运动',
            music: '音乐',
          },
        },
      ]}
    />
  </Form>
);
```

### 2. 高级控件（使用 FormSchema）

**生成代码**：

```jsx
import React from 'react';
import { Form } from 'antd';
import { FormSchema } from 'fintech';

export default () => (
  <Form>
    <FormSchema
      items={[
        {
          name: 'money',
          label: '金额',
          valueType: 'money',
        },
        {
          name: 'description',
          label: '描述',
          valueType: 'textarea',
        },
        {
          name: 'active',
          label: '是否激活',
          valueType: 'switch',
        },
        {
          name: 'birthday',
          label: '生日',
          valueType: 'datePicker',
          format: 'YYYY-MM-DD',
        },
        {
          name: 'range',
          label: '日期范围',
          valueType: 'rangePicker',
          format: 'YYYY-MM-DD',
        },
      ]}
    />
  </Form>
);
```

### 3. JSON 表单配置

**生成代码**：

```jsx
import React from 'react';
import { Form } from 'antd';
import { FormSchema } from 'fintech';

export default () => (
  <Form>
    <FormSchema
      items={[
        '基本信息',
        {
          name: 'name',
          label: '姓名',
          valueType: 'input',
        },
        {
          name: 'age',
          label: '年龄',
          valueType: 'number',
          colSpan: 8,
        },
        {
          name: 'gender',
          label: '性别',
          valueType: 'radio',
          valueEnum: {
            male: '男',
            female: '女',
          },
          colSpan: 16,
        },
        '联系方式',
        {
          name: 'email',
          label: '邮箱',
          valueType: 'input',
        },
        {
          name: 'phone',
          label: '电话',
          valueType: 'input',
        },
      ]}
      gutter={16}
      colSpan={12}
    />
  </Form>
);
```

### 4. 动态表单（使用 FormSchema）

**生成代码**：

```jsx
import React from 'react';
import { Form } from 'antd';
import { FormSchema } from 'fintech';

export default () => (
  <Form>
    <FormSchema
      items={[
        {
          name: 'userType',
          label: '用户类型',
          valueType: 'select',
          valueEnum: {
            admin: '管理员',
            user: '普通用户',
          },
        },
        (values) => {
          if (values.userType === 'admin') {
            return {
              name: 'permissions',
              label: '权限',
              valueType: 'checkbox',
              valueEnum: {
                read: '查看',
                write: '编辑',
                delete: '删除',
              },
            };
          }
          return null;
        },
      ]}
    />
  </Form>
);
```

### 5. 复杂布局

**生成代码**：

```jsx
import React from 'react';
import { Form } from 'antd';
import { FormSchema } from 'fintech';

export default () => (
  <Form>
    <FormSchema
      gutter={16}
      items={[
        '基本信息', // 字符串会渲染成 Divider
        {
          compact: [
            {
              name: 'firstName',
              label: '名',
              valueType: 'input',
            },
            {
              name: 'lastName',
              label: '姓',
              valueType: 'input',
            },
          ],
        },
        {
          name: 'address',
          label: '地址',
          valueType: 'textarea',
          colSpan: 24,
        },
        '联系方式', // 字符串会渲染成 Divider
        {
          name: 'city',
          label: '城市',
          valueType: 'input',
          colSpan: 8,
        },
        {
          name: 'province',
          label: '省份',
          valueType: 'input',
          colSpan: 8,
        },
        {
          name: 'zip',
          label: '邮编',
          valueType: 'input',
          colSpan: 8,
        },
      ]}
    />
  </Form>
);
```

### 6. 字典和远程数据（使用 FormSchema）

**生成代码**：

```jsx
import React from 'react';
import { Form } from 'antd';
import { FormSchema } from 'fintech';

export default () => (
  <Form>
    <FormSchema
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
  </Form>
);
```

### 7. 日期类型表单（使用 FormSchema）

**生成代码**：

```jsx
import React from 'react';
import { Form } from 'antd';
import { FormSchema } from 'fintech';

export default () => (
  <Form>
    <FormSchema
      items={[
        {
          name: 'startDate',
          label: '开始日期',
          valueType: 'datePicker',
          format: 'YYYY-MM-DD HH:mm:ss',
        },
        {
          name: 'dateRange',
          label: '日期范围',
          valueType: 'rangePicker',
          format: 'YYYY-MM-DD',
        },
      ]}
    />
  </Form>
);
```

**注意**：format 参数不能写在 inputProps 中，必须直接写在 FormItem 的属性中。

## 组件 API

### 基础属性

| 参数          | 说明                                            | 类型               | 默认值                 |
| ------------- | ----------------------------------------------- | ------------------ | ---------------------- |
| `name`        | 字段名                                          | string             | -                      |
| `label`       | 标签名                                          | string             | -                      |
| `dataIndex`   | name 的别名                                     | string \/ string[] | -                      |
| `title`       | label 的别名                                    | string             | -                      |
| `valueType`   | 控件类型                                        | string             | 'input'                |
| `required`    | 是否必填                                        | boolean            | true                   |
| `disabled`    | 内部子组件是否禁用                              | boolean            | false                  |
| `open`        | 是否展示组件，区别于原生的 hidden，不会收集字段 | boolean            | false                  |
| `placeholder` | 子组件提示信息                                  | string             | 请输入 or 请选择+label |
| `message`     | 自定义校验信息                                  | string             | '必填项'               |
| `rules`       | 校验规则                                        | array              | []                     |
| `inputProps`  | 设置 valueType 时生效，设置子组件属性           | object             | {}                     |
| `format`      | 设置日期格式，默认使用 dayjs                    | string             | 'YYYY-MM-DD'           |
| `valueEnum`   | 枚举值                                          | object             | -                      |
| `colSpan`     | 栅格数，外层包裹 Row 时可用                     | number             | 0                      |

### 支持的 valueType

| 类型          | 原生组件               | 使用组件   | 说明                                     |
| ------------- | ---------------------- | ---------- | ---------------------------------------- |
| `input`       | Input                  | -          | 文本输入框                               |
| `money`       | InputNumber            | -          | 金额输入框（带格式化）                   |
| `number`      | InputNumber            | -          | 数字输入框                               |
| `textarea`    | Input.Textarea         | -          | 多行文本输入框                           |
| `switch`      | Switch                 | -          | 开关                                     |
| `checkbox`    | Checkbox               | CheckList  | 复选框（自动转化为英文逗号分隔的字符串） |
| `radio`       | Radio                  | RadioList  | 单选框                                   |
| `select`      | Select                 | SelectList | 下拉选择器                               |
| `dict`        | Select                 | SelectList | 字典选择器                               |
| `datePicker`  | DatePicker             | DateQuick  | 日期选择器                               |
| `rangePicker` | DatePicker.RangePicker | DateQuick  | 日期范围选择器                           |

### FormSchema API

| 参数       | 说明                              | 类型               | 默认值 |
| ---------- | --------------------------------- | ------------------ | ------ |
| `unique`   | 唯一编号，支持 string 和 string[] | string \| string[] | -      |
| `items`    | 表单项列表                        | formitem[]         | -      |
| `gutter`   | 栅格间距                          | number \| array    | -      |
| `colSpan`  | 统一字段宽度                      | number             | -      |
| `disabled` | 是否禁用所有字段                  | boolean            | false  |

### FormUpdate API

| 参数       | 说明                       | 类型     | 默认值 |
| ---------- | -------------------------- | -------- | ------ |
| `children` | 回调函数，返回表单字段配置 | function | -      |

## 何时使用此技能

当你需要：

- 快速生成 `FormItem`、`FormSchema` 和 `FormUpdate` 组件的使用代码
- 了解 `FormItem` 组件在不同场景下的应用
- 为项目添加统一的表单字段，使用配置化方式管理
- 实现复杂的表单布局，通过 `colSpan` 和 `gutter` 配置
- 实现动态表单字段，通过函数返回字段配置
- 学习如何使用 `FormItem` 组件的各种控件类型

**推荐使用 `FormSchema` 的场景**：

- 表单字段较多的场景
- 需要统一管理表单布局的场景
- 需要动态生成表单字段的场景
- 希望通过配置化方式管理表单的场景

此技能将帮助你快速上手并正确使用 `fintech` 库中的 `FormItem` 组件，提高开发效率。

## 参考文档（相对路径）

- **组件文档**：[docs/components/FormItem.md](docs/components/FormItem.md)
- **组件源码**：[src/FormItem/index.tsx](src/FormItem/index.tsx)
- **组件分析报告**：[document/FormItem/README.md](document/FormItem/README.md)
