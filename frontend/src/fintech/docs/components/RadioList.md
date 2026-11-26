---
group: 通用
title: RadioList
order: 27
---

# RadioList

封装 [Radio](https://ant-design.antgroup.com/components/radio-cn)，使其支持各种数据格式

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { Flex, Divider } from 'antd';
import { RadioList } from 'fintech';

export default () => {
  return (
    <Flex gap="middle" vertical>
      <Divider titlePlacement="start">
        options 是枚举对象时，无需设置 fields 属性
      </Divider>
      <RadioList options={{ CHINA: '中国', USA: '美国' }} />
      <Divider titlePlacement="start">
        options 是字符串数组时，无需设置 fields 属性
      </Divider>
      <RadioList options={['中国', '美国']} />
      <Divider titlePlacement="start">
        options 是原生的 label value 结构，无需设置 fields 属性
      </Divider>
      <RadioList
        options={[
          { label: '中国', value: 'CHINA' },
          { label: '美国', value: 'USA' },
        ]}
      />
      <Divider titlePlacement="start">
        options 非原生的 label value 结构
      </Divider>
      <RadioList
        direction="vertical"
        fields={['key', 'name']}
        options={[
          { name: '中国', key: 'CHINA' },
          { name: '美国', key: 'USA' },
        ]}
      />
    </Flex>
  );
};
```

```jsx
/**
 * title: option.open
 */
import React from 'react';
import { RadioList } from 'fintech';

export default () => {
  return (
    <RadioList
      fields={['key', 'name']}
      options={[
        { name: '中国', key: 'CHINA' },
        { name: '美国', key: 'USA', open: false },
      ]}
    />
  );
};
```

## API

| 参数      | 说明           | 类型               | 默认值               |
| :-------- | :------------- | :----------------- | :------------------- |
| options   | 指定可选项     | `enum \| Option[]` |                      |
| fields    | 需要指定的字段 | `[string, string]` | `['value', 'label']` |
| direction | 排列方向       | `vertical`         |                      |
