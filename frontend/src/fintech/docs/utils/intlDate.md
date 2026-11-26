---
group: 工具
toc: content
order: 8
---

# intlDate

简化 `new Intl.DateTimeFormat` 使用方式

## 代码演示

```jsx
/**
 * title: format 函数，转化 Date 类型数据为 YYYY-MM-DD hh:mm:ss
 */
import React from 'react';
import { Space } from 'antd';
import { intlDate } from 'fintech';

export default () => {
  return (
    <Space orientation="vertical">
      {intlDate.format(new Date())}
      {intlDate.format(new Date(), '-', [0, 0, 0, 1, 1, 1])}
      {intlDate.format(new Date(), '/', [1, 1, 1])}
      {intlDate.format('01 Jan 2025 00:00:00 GMT', '-', [1, 1])}
      {intlDate.format('01 Jan 2025 00:00:00 GMT', '/')}
    </Space>
  );
};
```

```jsx
/**
 * title: 星期几的英文缩写转义
 */
import React from 'react';
import { Space } from 'antd';
import { intlDate } from 'fintech';

export default () => {
  return (
    <Space orientation="vertical">
      {intlDate.week('Mon')}
      {intlDate.week('Tue')}
      {intlDate.week('Wed')}
      {intlDate.week('Thu')}
      {intlDate.week('Fri')}
      {intlDate.week('Sat')}
      {intlDate.week('Sun')}
    </Space>
  );
};
```
