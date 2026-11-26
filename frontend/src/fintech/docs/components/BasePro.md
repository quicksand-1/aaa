---
group: 图表
title: BasePro
order: 3
---

## 复合图表（实验性组件，请谨慎使用）

[官方图表示例](https://ant-design-charts.antgroup.com/zh/examples/statistics/base/#space-layer)

```jsx
import React, { useState, useEffect } from 'react';
import { BasePro, request } from 'fintech';

export default () => {
  const [data, setData] = useState({});

  useEffect(() => {
    request('/charts/base.json').then((res) => {
      setData(res);
    });
  }, []);

  return (
    <BasePro
      legend={false}
      yAxisFormatter={(v) => `${v}%`}
      items={[
        {
          type: 'line',
          data: data.lineList || [],
          fields: ['x', 'y', 'category'],
          tooltip: false,
        },
        {
          type: 'point',
          data: data.pointList || [],
          fields: ['x', 'y', 'category'],
          tooltipTitle: (r) => r.category,
          tooltipItems: [
            { field: 'x', name: '分值' },
            {
              field: 'y',
              name: '占比',
              valueFormatter: (s) => `${s.toFixed(2)}%`,
            },
          ],
        },
      ]}
    />
  );
};
```
