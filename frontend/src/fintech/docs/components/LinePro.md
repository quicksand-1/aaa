---
group: 图表
title: LinePro
order: 5
---

## 折线图

[官方图表示例](https://ant-design-charts.antgroup.com/examples#statistics-line)

```jsx
/**
 * title: 单折线图
 */
import React, { useState, useEffect } from 'react';
import { LinePro, request } from 'fintech';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    request('/charts/line.json').then((res) => {
      setData(res);
    });
  }, []);

  return (
    <LinePro
      data={data}
      label={{
        // point 上的值展示格式化
        formatter: (t) => `${(+t / 100000000).toFixed(2)}亿`,
      }}
      fields={['terms', 'value']}
      xAxisFormatter={(v) => v + 1}
      yAxisFormatter={(v) => `${+v / 100000000}亿`}
      tooltipTitle={false}
      tooltipItems={[
        {
          field: 'terms',
          name: '期次',
          valueFormatter: (v) => `第 ${v + 1} 期`,
        },
        /**
         * name：可以设置该字段的别名，呈现在左边
         * valueFormatter：可以转义对应 field 字段的值，呈现在右边
         * */
        {
          field: 'value',
          name: '净值',
          valueFormatter: (v) => `${(+v / 100000000).toFixed(6)}亿`,
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: 多折线图
 */
import React, { useState, useEffect } from 'react';
import { LinePro, request } from 'fintech';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    request('/charts/line2.json').then((res) => {
      setData(res);
    });
  }, []);

  return (
    <LinePro
      data={data}
      fields={['terms', 'value', 'cnName']}
      xAxisFormatter={(v) => v + 1}
      yAxisFormatter={(v) => `${+v / 100000000}亿`}
      tooltipTitle={(r) => `第 ${r.terms + 1} 期`}
      tooltipItems={[
        /**
         * 当图表类型是"组类型的折线图"时，items 中设置 name 是无效的，默认左边呈现的内容是读取 cnName 字段
         * */
        {
          field: 'value',
          valueFormatter: (v) => `${(+v / 100000000).toFixed(6)}亿`,
        },
      ]}
    />
  );
};
```

### API

| 参数           | 说明                  | 类型                                                                                                     | 默认值 |
| :------------- | :-------------------- | :------------------------------------------------------------------------------------------------------- | :----- |
| height         | 图表高度              | number                                                                                                   | 500    |
| fields         | 字段映射              | `['xField', 'yField', 'colorField']`                                                                     |        |
| xAxisFormatter | x 轴刻度值线格式化    | (datum, index, data, Vector) => DisplayObject                                                            |        |
| yAxisFormatter | y 轴刻度值线格式化    | (datum, index, data, Vector) => DisplayObject                                                            |        |
| tooltipTitle   | 提示器标题            | (data) => ReactNode                                                                                      |        |
| tooltipItems   | 提示词对应 items 内容 | [items](https://ant-design-charts.antgroup.com/options/plots/tooltip#item)                               |        |
| point          | 线段圆点              | `boolean \| Record`                                                                                      | true   |
| label          | 线段圆点上的值展示    | `boolean \| Record \| [labelProps](https://ant-design-charts.antgroup.com/options/plots/label/overview)` | false  |
| smooth         | 折线是否平滑          | boolean                                                                                                  | true   |

#### point 默认使用属性

```
{
  shapeField: 'circle',
  sizeField: 2
}
```

#### label 默认使用属性

```
{
  textBaseline: 'bottom',
  transform: [
    {
      padding: 20,
      // https://ant-design-charts.antgroup.com/options/plots/label/overlap-hide
      type: 'overlapHide',
    },
  ],
}
```
