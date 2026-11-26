---
group: 通用
title: Chronobreak
order: 3
---

# Chronobreak

时空断裂，支持表单数据缓存和回显

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { Form, Space, Button, message } from 'antd';
import { Chronobreak, FormSchema, LinkBtn } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(values) => {
        message.success('提交成功');
        Chronobreak.storage.set({
          id: '1',
          values,
        });
        Chronobreak.storage.set({
          id: '2',
          values,
        });
      }}
    >
      <FormSchema
        items={[
          { name: 'name', label: '姓名' },
          { name: 'age', label: '年龄' },
        ]}
      />
      <Space>
        <Button htmlType="submit">提交</Button>
        <Chronobreak id="1" form={form} />
        <Chronobreak id="2" form={form}>
          <LinkBtn>回显</LinkBtn>
        </Chronobreak>
      </Space>
    </Form>
  );
};
```

## API

| 参数 | 说明         | 类型   | 默认值 |
| :--- | :----------- | :----- | :----- |
| id   | 唯一标识     | string |        |
| form | 表单实例对象 | Form   |        |

### Chronobreak.storage

```js | pure
// 设置，一般都是在表单提交成功后调用
Chronobreak.storage.set({
  id: '唯一编号',
  values: {},
});

// 获取，一般用于表单初始化时调用
Chronobreak.storage.get({
  id: '唯一编号',
});
```
