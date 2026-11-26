---
group: 图表
title: BarPro
order: 2
---

## 条形图

[官方图表示例](https://ant-design-charts.antgroup.com/examples/statistics/bar)

```jsx
import React, { useState, useEffect } from 'react';
import { BarPro, request } from 'fintech';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    request('/charts/bar.json').then((res) => {
      setData(res);
    });
  }, []);

  return (
    <BarPro
      data={data}
      fields={['type', 'value', 'type']}
      label={{
        text: (d) => `${d.value}%`,
        style: {
          textAlign: (d) => (+d.value > 2 ? 'right' : 'start'),
        },
      }}
      tooltipTitle={() => '笔数占比'}
      tooltipItems={[
        (d) => ({
          name: d.type,
          value: `${d.value}%`,
        }),
      ]}
    />
  );
};
```

### API

| 参数           | 说明                                                         | 类型                                                                       | 默认值 |
| :------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------- | :----- |
| height         | 图表高度                                                     | number                                                                     | 500    |
| autoHeight     | 自动设置高度；当 data 数据量大于 20 条时，会自动设置整体高度 | boolean                                                                    | true   |
| fields         | 字段映射                                                     | `['xField', 'yField', 'colorField']`                                       |        |
| xAxisFormatter | x 轴刻度值线格式化                                           | (datum, index, data, Vector) => DisplayObject                              |        |
| yAxisFormatter | y 轴刻度值线格式化                                           | (datum, index, data, Vector) => DisplayObject                              |        |
| tooltipTitle   | 提示器标题                                                   | (data) => ReactNode                                                        |        |
| tooltipItems   | 提示词对应 items 内容                                        | [items](https://ant-design-charts.antgroup.com/options/plots/tooltip#item) |        |
