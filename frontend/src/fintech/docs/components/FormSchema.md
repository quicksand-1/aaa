---
group: 通用
title: FormSchema
order: 11
---

# FormSchema

基于 [FormItem](/components/form-item) 的 JSON Schema 表单配置组件，支持通过配置数组快速生成表单。

## 代码演示

```jsx
/**
 * title: FormSchema 用法
 * description: 当 item 是字符串时，会默认渲染成 Divider 组件
 */
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
        alert(JSON.stringify(res));
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={8}
        items={[
          'Input',
          { name: 'eventCode', label: '事件编码' },
          { name: 'eventName', label: '事件名称' },
          'Number',
          {
            name: 'age',
            label: '年龄',
            valueType: 'number',
            tooltip: '年龄都是大于零的正整数',
            inputProps: { precision: 0, min: 0, suffix: '岁' },
          },
          'Money',
          { name: 'income', label: '收入', valueType: 'money' },
          'Textarea',
          {
            name: 'remark',
            label: '备注',
            valueType: 'textarea',
            inputProps: { rows: 3 },
          },
          'Select',
          {
            name: 'nationality',
            label: '国籍',
            valueType: 'select',
            valueEnum: { CHINA: '中国', USA: '美国' },
          },
          {
            name: 'address',
            label: '地区',
            valueType: 'select',
            inputProps: { options: { BJ: '北京', NY: '纽约' } },
          },
          'Switch',
          { name: 'switch', label: '开关', valueType: 'switch' },
          'DatePicker',
          { name: 'date', label: '日期', valueType: 'datePicker' },
          {
            name: 'dateNonPast',
            label: '不能选过去',
            valueType: 'datePicker',
            inputProps: {
              placeholder: '不能选过去的日期',
              disabledDate: (current) => current < dayjs().startOf('day'),
            },
          },
          {
            name: 'dateFuture',
            label: '未来',
            valueType: 'datePicker',
            inputProps: {
              placeholder: '只能选择未来的日期',
              disabledDate: (current) => current < dayjs(),
            },
          },
          {
            name: 'dateInterval',
            label: '区间',
            valueType: 'datePicker',
            inputProps: {
              placeholder: '只能选择 2024-10-10 ~ 2024-12-12',
              disabledDate: (current) =>
                current > dayjs('2024-12-12') || current < dayjs('2024-10-10'),
            },
          },
          'RangePicker',
          {
            name: 'dateRange',
            label: '资源期限',
            valueType: 'rangePicker',
            inputProps: {
              disabledDate: (current) =>
                current > dayjs('2024-12-12') || current < dayjs('2024-10-10'),
            },
          },
          'Checkbox',
          {
            name: 'lifeAttributes',
            label: '人生属性',
            valueType: 'checkbox',
            valueEnum: { Rich: '暴富', Beautiful: '绝美' },
          },
          {
            name: 'lifeAttributes2',
            label: '人生属性2',
            valueType: 'checkbox',
            inputProps: {
              direction: 'vertical',
              options: { Rich: '暴富', Beautiful: '绝美' },
            },
          },
          'Radio',
          {
            name: 'animal',
            label: '动物',
            valueType: 'radio',
            valueEnum: { cat: '猫', dog: '狗' },
          },
          {
            name: 'animal2',
            label: '动物2',
            valueType: 'radio',
            inputProps: {
              direction: 'vertical',
              options: { cat: '猫', dog: '狗' },
            },
          },
          'Dict',
          {
            name: 'dictKey',
            label: '字典',
            valueType: 'dict',
            valueEnum: 'dateType',
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

```jsx
/**
 * title: 表单项联动
 */
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form, FormUpdate, FormItem } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        alert(JSON.stringify(res));
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={8}
        items={[
          {
            name: 'nationality',
            label: '国籍',
            valueType: 'select',
            valueEnum: [{}],
            inputProps: {
              fields: ['value', 'title'],
              options: [
                { title: '中国', value: 'CHINA' },
                { title: '美国', value: 'USA' },
              ],
            },
          },
          ({ nationality }) => {
            if (nationality === 'CHINA') {
              return {
                colSpan: 24,
                name: 'city',
                label: '城市',
                valueType: 'radio',
                valueEnum: ['北京', '上海', '乌鲁木齐', '齐齐哈尔'],
              };
            }

            if (nationality === 'USA') {
              return [
                {
                  colSpan: 24,
                  name: 'city',
                  label: '城市',
                  valueType: 'radio',
                  valueEnum: ['西雅图', '纽约'],
                },
              ];
            }
          },
        ]}
      />
      <FormUpdate>
        {({ city }) => {
          if (city === '北京') {
            return (
              <FormItem
                label="街道"
                name="street"
                valueType="select"
                valueEnum={['王府井', '东城街', '西城街']}
              />
            );
          }
        }}
      </FormUpdate>
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

```jsx
/**
 * title: FormSchema 表单禁用
 */
import React, { useState } from 'react';
import { Button, Switch } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [disabled, setDisabled] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <Switch
        value={disabled}
        checkedChildren="启用"
        unCheckedChildren="禁用"
        onChange={(checked) => setDisabled(checked)}
      />
      <br />
      <br />
      <Form
        form={form}
        onFinish={(res) => {
          alert(JSON.stringify(res));
        }}
      >
        <FormSchema
          gutter={12}
          colSpan={8}
          disabled={disabled}
          items={[
            { dataIndex: 'eventCode', title: '事件编码' },
            { dataIndex: 'eventName', title: '事件名称' },
          ]}
        />
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form>
    </>
  );
};
```

```jsx
/**
 * title: Checkbox 数据转化
 * description: 会自动转化为英文逗号分隔的字符串
 */
import React from 'react';
import { Button, Space } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <>
      <Form
        form={form}
        onFinish={(res) => {
          console.log(res);
        }}
      >
        <FormSchema
          items={[
            {
              tooltip: '返回字符串格式',
              dataIndex: 'fruit',
              title: '水果',
              valueType: 'checkbox',
              inputProps: {
                options: { Apple: '苹果', Pear: '梨', Orange: '橙子' },
              },
            },
            {
              tooltip: '自定义分隔符',
              dataIndex: 'fruit2',
              title: '水果2',
              valueType: 'checkbox',
              inputProps: {
                delimiter: '/',
                options: { Apple: '苹果', Pear: '梨', Orange: '橙子' },
              },
            },
            {
              tooltip: '返回数组格式',
              dataIndex: 'fruit3',
              title: '水果3',
              valueType: 'checkbox',
              inputProps: {
                delimiter: null,
                options: { Apple: '苹果', Pear: '梨', Orange: '橙子' },
              },
            },
          ]}
        />
        <Space>
          <Button
            onClick={() => {
              form.setFieldsValue({
                fruit: 'Pear,Orange',
                fruit2: 'Pear/Orange',
                fruit3: ['Pear', 'Orange'],
              });
            }}
          >
            回显
          </Button>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Space>
      </Form>
    </>
  );
};
```

```jsx
/**
 * title: 使用 unique 属性隐藏字段
 * description: 会自动创建 hidden 字段，用于唯一标识表单数据
 */
import React from 'react';
import { Button, Space } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <>
      <Form
        form={form}
        onFinish={(res) => {
          console.log(res);
        }}
      >
        <FormSchema
          unique={['id', 'sessionId']}
          items={[{ name: 'name', label: '标签名称' }]}
        />
        <Space>
          <Button
            onClick={() => {
              form.setFieldsValue({
                id: '01',
                sessionId: 'session01',
                name: '图书',
              });
            }}
          >
            回显
          </Button>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Space>
      </Form>
    </>
  );
};
```

```jsx
/**
 * title: 紧凑型表单组合
 */
import React from 'react';
import { Button } from 'antd';
import { Form, FormSchema } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <>
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
                  inputProps: {
                    precision: 0,
                    min: 0,
                  },
                },
              ],
            },
            {
              colSpan: 12,
              label: '默认阈值',
              tooltip: '例如：≤ 3%',
              compact: [
                {
                  noStyle: true,
                  valueType: 'select',
                  valueEnum: ['>', '>=', '=', '<', '<='],
                  name: 'thresholdUnit',
                  inputProps: {
                    style: { flex: '0 0 100px' },
                  },
                },
                {
                  noStyle: true,
                  valueType: 'number',
                  name: 'thresholdValue',
                  inputProps: {
                    min: 0,
                    suffix: '%',
                  },
                },
              ],
            },
          ]}
        />
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form>
    </>
  );
};
```

```jsx
/**
 * title: 日期类型表单
 * description: format 参数不能写在 inputProps 中
 */
import React from 'react';
import { Button } from 'antd';
import { Form, FormSchema } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <>
      <Form
        form={form}
        onFinish={(res) => {
          console.log(res);
        }}
      >
        <FormSchema
          gutter={12}
          colSpan={6}
          items={[
            {
              name: 'date',
              label: '日期',
              valueType: 'datePicker',
            },
            {
              name: 'month',
              label: '月份',
              valueType: 'datePicker',
              format: 'YYYY-MM',
              inputProps: {
                picker: 'month',
              },
            },
            {
              name: 'quarter',
              label: '季度',
              valueType: 'datePicker',
              format: 'YYYY-Q',
              inputProps: {
                picker: 'quarter',
              },
            },
            {
              name: 'year',
              label: '年度',
              valueType: 'datePicker',
              format: 'YYYY',
              inputProps: {
                picker: 'year',
              },
            },
          ]}
        />
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form>
    </>
  );
};
```

```jsx
/**
 * title: 表单验证
 * description: 使用 rules 属性添加验证规则
 */
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
            name: 'code',
            label: '编码',
            rules: [{ max: 64, message: '最多64个字符' }],
          },
          {
            name: 'email',
            label: '邮箱',
            required: false,
            rules: [{ type: 'email', message: '请输入正确格式的邮箱' }],
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

```jsx
/**
 * title: 自定义组件
 * description: 使用 children 属性自定义表单项内容
 */
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
          {
            name: 'priority',
            label: '优先级',
            children: (
              <Select
                style={{ width: '100%' }}
                options={[
                  { value: 'high', label: '高' },
                  { value: 'medium', label: '中' },
                  { value: 'low', label: '低' },
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

```jsx
/**
 * title: 集成 EditTable 和 SelectList
 * description: 在表单中集成 EditTable 和 SelectList 组件，实现复杂的数据编辑场景
 */
import React from 'react';
import { Button } from 'antd';
import { FormSchema, EditTable, SelectList, Form } from 'fintech';

const sourceOptions = {
  data_query: '数据查询',
  summary_generation: '摘要生成',
};

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
            colSpan: 8,
            name: 'name',
            label: '报表名称',
            placeholder: '例如: 基金周报',
          },
          {
            colSpan: 8,
            name: 'report_code',
            label: '报表编码',
            placeholder: '例如: fund_weekly_2024',
          },
          {
            colSpan: 8,
            name: 'llm',
            label: 'LLM 模型',
            valueType: 'select',
            placeholder: '请选择 LLM 模型',
            inputProps: {
              dataPath: 'available',
              url: '/general/user/llm/list',
              fields: ['label', 'label'],
            },
          },
          {
            name: 'template',
            label: 'Markdown 模板',
            colSpan: 24,
            valueType: 'textarea',
            extra: '使用 {{ 变量名 }} 作为占位符，例如 {{ total_assets }}',
            inputProps: {
              rows: 6,
              className: 'font-mono',
              placeholder:
                '# 基金周报\n\n本周总规模为 {{ total_assets }} 亿元...',
            },
          },
          '变量定义',
          {
            colSpan: 24,
            name: 'variables',
            children: (
              <EditTable
                name="variables"
                createDefaultValue={{
                  source: 'data_query',
                }}
                columns={[
                  {
                    title: '变量名',
                    dataIndex: 'key',
                    fieldProps: {
                      placeholder: '例如：total_assets',
                    },
                  },
                  {
                    title: '数据来源',
                    dataIndex: 'source',
                    valueType: 'select',
                    valueEnum: sourceOptions,
                  },
                  {
                    title: '数据集',
                    dataIndex: 'dataset_id',
                    valueType: 'select',
                    fieldProps: {
                      cache: true,
                      dataPath: 'datas',
                      url: '/selectList/datasets.json',
                      fields: ['datasetId', 'name'],
                      placeholder: '请选择数据集',
                    },
                  },
                  {
                    title: '查询提示词',
                    dataIndex: 'prompt',
                    valueType: 'textarea',
                    fieldProps: {
                      placeholder:
                        '查询提示词，例如：查询截止最新的总资产规模，仅返回数值，单位亿元',
                      rows: 2,
                    },
                  },
                  {
                    width: 200,
                    title: '回退值',
                    dataIndex: 'fallback',
                    fieldProps: {
                      placeholder: '查询失败时使用的默认值，如 N/A（可选）',
                    },
                  },
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

```jsx
/**
 * title: 条件渲染
 * description: 使用 open 属性控制表单项显示
 */
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
            name: 'name',
            label: '名称',
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
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

## API

| 参数        | 说明                                                                         | 类型               | 默认值 |
| :---------- | :--------------------------------------------------------------------------- | :----------------- | :----- |
| required    | 是否必填                                                                     | boolean            | true   |
| placeholder | 占位符                                                                       | string             |        |
| gutter      | 栅格间距                                                                     | number             |        |
| colSpan     | 统一分配 FormItem 的 colSpan，省略每个元素的属性拼写，权重 FormItem > Schema | number             |        |
| unique      | 唯一编号，一般是自增的 id，会自动生成隐藏的 id 字段                          | string \/ string[] |        |
| items       | 表单项列表                                                                   | formitem[]         |        |
| disabled    | 内部子组件是否禁用                                                           | boolean            | false  |

### ValueType

| 参数        | 原生组件               | 使用组件   |
| :---------- | :--------------------- | :--------- |
| input       | Input                  |            |
| number      | InputNumber            |            |
| money       | InputNumber            |            |
| textarea    | Input.Textarea         |            |
| switch      | Switch                 |            |
| datePicker  | DatePicker             | DateQuick  |
| rangePicker | DatePicker.RangePicker | DateQuick  |
| select      | Select                 | SelectList |
| checkbox    | Checkbox               | CheckList  |
| radio       | Radio                  | RadioList  |
| dict        | Select                 | SelectList |

### items 支持的类型

| 类型           | 说明                                                                    |
| :------------- | :---------------------------------------------------------------------- |
| 字符串         | 渲染成 Divider 组件                                                     |
| 对象           | 渲染成 FormItem 组件，支持 dataIndex 和 title 作为 name 和 label 的别名 |
| 函数           | 函数返回表单项配置，支持表单联动                                        |
| 数组 (compact) | 紧凑型表单组合，使用 Space.Compact 包裹                                 |
| ReactNode      | 直接渲染                                                                |

## 特性

1. **统一配置**：通过 `gutter` 和 `colSpan` 统一设置栅格布局
2. **表单联动**：支持函数形式的表单项，根据其他字段的值动态渲染表单项
3. **唯一编号**：通过 `unique` 属性自动生成隐藏的唯一标识字段
4. **紧凑组合**：支持 `compact` 属性创建紧凑型表单组合
5. **禁用控制**：支持通过 `disabled` 属性统一控制表单项的禁用状态
6. **字段别名**：支持 `dataIndex` 和 `title` 作为 `name` 和 `label` 的别名，与表格 columns 配置保持一致
7. **条件显示**：通过 `open` 属性控制表单项的显示，可以是布尔值或函数
8. **隐藏字段**：通过 `hidden` 属性隐藏字段，隐藏的字段不参与布局但会参与表单提交

## 注意

### 禁止使用

```jsx | pure
// 禁止
{
  name: 'id',
  label: 'ID',
  hidden: true,
  required: false,
},

// 请使用 unique 属性隐藏字段
unique={['id']}
```

```jsx | pure
// 禁止，默认 required 为 true
{
  rules: [{ required: true, message: '请输入' }],
},
```
