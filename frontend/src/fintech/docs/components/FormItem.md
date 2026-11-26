---
group: 通用
title: FormItem
order: 10
---

# FormItem

封装 [Form](https://ant-design.antgroup.com/components/form-cn)

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import dayjs from 'dayjs';
import { Row, Divider, Button } from 'antd';
import { FormItem, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(values) => {
        console.log(values);
      }}
      onFinishFailed={({ values }) => {
        console.log(values);
      }}
    >
      <Row gutter={12}>
        <Divider titlePlacement="start">Input</Divider>
        <FormItem colSpan={8} name="name" label="姓名" required={false} />
        <FormItem
          colSpan={8}
          name="email"
          label="email"
          rules={{ type: 'email' }}
        />
        <Divider titlePlacement="start">Number</Divider>
        <FormItem
          colSpan={8}
          name="age"
          label="年龄"
          valueType="number"
          tooltip="年龄都是大于零的正整数"
          inputProps={{
            precision: 0,
            min: 0,
            suffix: '岁',
          }}
        />
        <Divider titlePlacement="start">Money</Divider>
        <FormItem colSpan={8} name="income" label="收入" valueType="money" />
        <Divider titlePlacement="start">Textarea</Divider>
        <FormItem
          colSpan={8}
          name="remark"
          label="备注"
          valueType="textarea"
          inputProps={{
            rows: 3,
          }}
        />
        <Divider titlePlacement="start">Select</Divider>
        <FormItem
          colSpan={8}
          name="nationality"
          label="国籍"
          valueType="select"
          valueEnum={{ CHINA: '中国', USA: '美国' }}
        />
        <FormItem
          colSpan={8}
          name="address"
          label="地区"
          valueType="select"
          inputProps={{
            options: { BJ: '北京', NY: '纽约' },
          }}
        />
        <Divider titlePlacement="start">Switch</Divider>
        <FormItem colSpan={8} name="switch" label="开关" valueType="switch" />
        <Divider titlePlacement="start">DatePicker</Divider>
        <FormItem colSpan={8} name="date" label="日期" valueType="datePicker" />
        <FormItem
          colSpan={8}
          name="dateNonPast"
          label="不能选过去"
          valueType="datePicker"
          inputProps={{
            placeholder: '不能选过去的日期',
            disabledDate: '<0',
          }}
        />
        <FormItem
          colSpan={8}
          name="dateFuture"
          label="未来"
          valueType="datePicker"
          inputProps={{
            placeholder: '只能选择未来的日期',
            disabledDate: '>0',
          }}
        />
        <FormItem
          colSpan={8}
          name="dateInterval"
          label="区间"
          valueType="datePicker"
          inputProps={{
            placeholder: '只能选择 2025-01-01 ~ 2025-12-30',
            disabledDate: (current, { dayjs }) =>
              current > dayjs('2025-12-30') || current < dayjs('2025-01-01'),
          }}
        />
        <Divider titlePlacement="start">RangePicker</Divider>
        <FormItem
          colSpan={8}
          name="dateRange"
          label="资源期限"
          valueType="rangePicker"
          inputProps={{
            disabledDate: (current, { dayjs }) =>
              current > dayjs('2024-12-12') || current < dayjs('2024-10-10'),
          }}
        />
        <FormItem
          colSpan={8}
          name="30RangeDate"
          label="过去30日区间"
          valueType="rangePicker"
          initialValue={[
            dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            dayjs().format('YYYY-MM-DD'),
          ]}
        />
        <FormItem
          colSpan={8}
          name="30AddRangeDate"
          label="未来30日区间"
          valueType="rangePicker"
          initialValue={[
            dayjs().format('YYYY-MM-DD'),
            dayjs().add(30, 'day').format('YYYY-MM-DD'),
          ]}
        />
        <Divider titlePlacement="start">Checkbox</Divider>
        <FormItem
          colSpan={8}
          name="lifeAttributes"
          label="人生属性"
          valueType="checkbox"
          valueEnum={{ Rich: '暴富', Beautiful: '绝美' }}
        />
        <FormItem
          colSpan={8}
          name="lifeAttributes2"
          label="人生属性2"
          valueType="checkbox"
          inputProps={{
            direction: 'vertical',
            options: { Rich: '暴富', Beautiful: '绝美' },
          }}
        />
        <Divider titlePlacement="start">Radio</Divider>
        <FormItem
          colSpan={8}
          name="animal"
          label="动物"
          valueType="radio"
          valueEnum={{ cat: '猫', dog: '狗' }}
        />
        <FormItem
          colSpan={8}
          name="animal2"
          label="动物2"
          valueType="radio"
          inputProps={{
            direction: 'vertical',
            options: { cat: '猫', dog: '狗' },
          }}
        />
        <Divider titlePlacement="start">Dict</Divider>
        <FormItem
          colSpan={8}
          name="dictKey"
          label="字典"
          valueType="dict"
          valueEnum="dateType"
        />
        <Divider titlePlacement="start">Tree</Divider>
        <FormItem
          colSpan={12}
          name="tree"
          label="树"
          valueType="tree"
          valueEnum={[
            {
              children: [
                {
                  children: [
                    {
                      disabled: false,
                      key: 'CB5F6DAE-0681-45CD-AD47-23E51A4FFDB3',
                      title: '东北运营',
                      type: 'D',
                    },
                    {
                      disabled: false,
                      key: '5996C605-F197-46CD-B949-A8B1E817A378',
                      title: '管理部',
                      type: 'D',
                    },
                    {
                      disabled: false,
                      key: '2DF77CAA-F20D-466F-B017-A0DF14F6EE55',
                      title: '市场部',
                      type: 'D',
                    },
                  ],
                  disabled: false,
                  key: '86965D0A-D5FE-4ABC-BBB3-3153D5B2DBC4',
                  title: '东北分公司',
                  type: 'C',
                },
                {
                  disabled: false,
                  key: '16936478-9628-45DE-ACAA-E5D5E61E1F6B',
                  title: '权限测试部门',
                  type: 'D',
                },
              ],
              disabled: false,
              key: 'org',
              title: '信托',
              type: 'O',
            },
          ]}
        />
        <FormItem
          colSpan={12}
          name="tree2"
          label="异步树"
          valueType="tree"
          inputProps={{
            url: '/tree/demo.json',
          }}
        />
        <FormItem
          colSpan={12}
          name="tree3"
          label="额外属性树"
          valueType="tree"
          inputProps={{
            checkStrictly: true,
            defaultExpandAll: true,
            fields: ['value', 'label', 'child'],
          }}
          valueEnum={[
            {
              disabled: false,
              value: 'org',
              label: '信托',
              type: 'O',
              child: [
                {
                  disabled: false,
                  value: '86965D0A-D5FE-4ABC-BBB3-3153D5B2DBC4',
                  label: '东北分公司',
                  type: 'C',
                  child: [
                    {
                      disabled: false,
                      value: 'CB5F6DAE-0681-45CD-AD47-23E51A4FFDB3',
                      label: '东北运营',
                      type: 'D',
                    },
                    {
                      disabled: false,
                      value: '5996C605-F197-46CD-B949-A8B1E817A378',
                      label: '管理部',
                      type: 'D',
                    },
                    {
                      disabled: false,
                      value: '2DF77CAA-F20D-466F-B017-A0DF14F6EE55',
                      label: '市场部',
                      type: 'D',
                    },
                  ],
                },
                {
                  disabled: false,
                  value: '16936478-9628-45DE-ACAA-E5D5E61E1F6B',
                  label: '权限测试部门',
                  type: 'D',
                },
              ],
            },
          ]}
        />
      </Row>
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

## API

| 参数        | 说明                                                                      | 类型                    | 默认值                 |
| :---------- | :------------------------------------------------------------------------ | :---------------------- | :--------------------- |
| dataIndex   | name 的别名                                                               | string \/ string[]      |                        |
| title       | label 的别名                                                              | string                  |                        |
| required    | 是否必填                                                                  | boolean                 | true                   |
| valueType   | 内置子组件模式                                                            | [ValueType](#valuetype) | input                  |
| format      | 设置日期格式，默认使用 dayjs；会自动对 dayjs 对象进行格式化               | string                  | YYYY-MM-DD             |
| message     | 自定义校验信息                                                            | string                  | 必填项                 |
| open        | 是否展示组件，区别于原生的 hidden，不会收集字段                           | boolean                 | false                  |
| disabled    | 内部子组件是否禁用，只对 valueType 生效，优先级低于 `inputProps.disabled` | boolean                 | false                  |
| inputProps  | 设置 valueType 时生效，设置子组件属性                                     | object                  |                        |
| placeholder | 子组件提示信息                                                            | string                  | 请输入 or 请选择+label |
| valueEnum   | 枚举值，参考用例                                                          | object                  |                        |
| colSpan     | 栅格数，外层包裹 Row 时可用                                               | number                  | 0                      |

### ValueType

| 参数        | 原生组件               | 使用组件   |
| :---------- | :--------------------- | :--------- |
| input       | Input                  |            |
| number      | InputNumber            |            |
| money       | InputNumber            |            |
| textarea    | Input.Textarea         |            |
| password    | Input.Password         |            |
| switch      | Switch                 |            |
| datePicker  | DatePicker             | DateQuick  |
| rangePicker | DatePicker.RangePicker | DateQuick  |
| select      | Select                 | SelectList |
| checkbox    | Checkbox               | CheckList  |
| radio       | Radio                  | RadioList  |
| dict        | Select                 | SelectList |
| tree        | Tree                   | AsyncTree  |

## PS

1. 非 form 环境下如何获取表单实例？

```jsx | pure
import { FormContext } from 'antd/es/form/context';

const { form } = useContext(FormContext);
```
