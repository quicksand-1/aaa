---
group: 通用
title: StatusBadge
order: 28
---

# StatusBadge

状态点，一般用于 Table 中状态展示，和 Pro Components 的用法兼容

## 代码演示

```jsx
/**
 * title: 默认枚举
 * description: 状态枚举值在多个组件中都是通用的
 */
import React from 'react';
import { Flex, Space } from 'antd';

export default () => {
  return (
    <Flex vertical>
      <Space style={{ color: '#52c41a' }}>Success: #52c41a</Space>
      <Space style={{ color: '#ff4d4f' }}>Error: #ff4d4f</Space>
      <Space style={{ color: 'rgba(0,0,0,0.25)' }}>
        Default: rgba(0,0,0,0.25)
      </Space>
      <Space style={{ color: '#1677ff' }}>Processing: #1677ff</Space>
      <Space style={{ color: '#faad14' }}>Warning: #faad14</Space>
    </Flex>
  );
};
```

```jsx
/**
 * title: 基础用法
 */
import React, { useState } from 'react';
import { StatusBadge, RadioList } from 'fintech';

const Enum = {
  succ: { text: '成功', status: 'Success' },
  fail: { text: '失败', status: 'Error' },
  stop: { text: '停止', status: 'Default' },
  init: { text: '初始化', status: 'Processing' },
  early: { text: '预警', status: 'Warning' },
};

export default () => {
  const [value, setValue] = useState('succ');

  return (
    <>
      <RadioList
        value={value}
        options={Object.keys(Enum)}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <br />
      <br />
      <StatusBadge value={value} valueEnum={Enum} />
    </>
  );
};
```

## API

| 参数      | 说明   | 类型      | 默认值 |
| :-------- | :----- | :-------- | :----- |
| value     | 枚举值 | string    |        |
| valueEnum | 枚举   | ValueEnum |        |
