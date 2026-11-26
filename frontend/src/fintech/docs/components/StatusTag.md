---
group: 通用
title: StatusTag
order: 30
---

# StatusTag

状态标签

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useState } from 'react';
import { StatusTag, RadioList } from 'fintech';

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
      <StatusTag value={value} valueEnum={Enum} />
    </>
  );
};
```

```jsx
/**
 * title: 自定义颜色和icon
 */
import React, { useState } from 'react';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  StopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { StatusTag, RadioList } from 'fintech';

const Enum = {
  succ: { text: '成功', color: '#389e0d', icon: <CheckCircleOutlined /> },
  fail: { text: '失败', color: '#cd201f', icon: <ExclamationCircleOutlined /> },
  stop: { text: '停止', color: '#595959', icon: <StopOutlined /> },
  init: { text: '初始化', color: '#005aad', icon: <LoadingOutlined /> },
  early: { text: '预警', color: '#d48806', icon: <WarningOutlined /> },
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
      <StatusTag value={value} valueEnum={Enum} />
    </>
  );
};
```

## API

| 参数      | 说明   | 类型      | 默认值 |
| :-------- | :----- | :-------- | :----- |
| value     | 枚举值 | string    |        |
| valueEnum | 枚举   | ValueEnum |        |
