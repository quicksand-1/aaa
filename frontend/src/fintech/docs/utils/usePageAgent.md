---
group: Agent
title: usePageAgent
order: 1
---

> 基于 page-agent.js 实现的智能体组件

- [文档](https://alibaba.github.io/page-agent/docs/introduction/quick-start)
- [支持模型](https://alibaba.github.io/page-agent/docs/features/models)
- 依赖安装：`npm install page-agent`
- 初始化时会直接读取当前启用的 Xllm 配置
- 使用前请先在 `LLMConfig` 中启用一条可用的 LLM 配置

## 代码演示

```jsx
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { FormSchema, Form } from 'fintech';
import usePageAgent from 'fintech/hooks/usePageAgent';

export default () => {
  usePageAgent();
  const [form] = Form.useForm();
  const [json, setJson] = useState('');

  return (
    <Form
      form={form}
      onFinish={(values) => {
        setJson(JSON.stringify(values));
        message.success('提交成功');
      }}
    >
      <FormSchema
        items={[
          {
            name: 'name',
            label: '姓名',
          },
          {
            name: 'nationality',
            label: '国籍',
            valueType: 'select',
            valueEnum: { CHINA: '中国', USA: '美国' },
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
      <pre>{json}</pre>
    </Form>
  );
};
```
