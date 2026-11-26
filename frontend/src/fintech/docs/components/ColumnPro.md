---
group: 图表
title: ColumnPro
order: 4
---

## 柱状图

[官方图表示例](https://ant-design-charts.antgroup.com/examples#statistics-column)

```jsx
/**
 * title: 单柱状图
 */
import React, { useState, useEffect } from 'react';
import { ColumnPro, request } from 'fintech';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    request('/charts/line.json').then((res) => {
      setData(res);
    });
  }, []);

  return (
    <ColumnPro
      data={data}
      label={{
        textBaseline: 'bottom',
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
 * title: 多柱状图
 */
import React, { useState, useEffect } from 'react';
import { ColumnPro, request, RadioList } from 'fintech';

export default () => {
  const [data, setData] = useState([]);
  const [radioValue, setRadioValue] = useState('group');

  useEffect(() => {
    request('/charts/line2.json').then((res) => {
      setData(res);
    });
  }, []);

  return (
    <>
      <RadioList
        value={radioValue}
        options={{ group: '分组', stack: '堆叠' }}
        onChange={(e) => {
          setRadioValue(e.target.value);
        }}
      />
      <br />
      <ColumnPro
        {...{ [radioValue]: true }}
        data={data}
        fields={['terms', 'value', 'cnName']}
        xAxisFormatter={(v) => v + 1}
        yAxisFormatter={(v) => `${+v / 100000000}亿`}
        tooltipTitle={(r) => `第 ${r.terms + 1} 期`}
        tooltipItems={[
          {
            field: 'value',
            valueFormatter: (v) => `${(+v / 100000000).toFixed(6)}亿`,
          },
        ]}
      />
    </>
  );
};
```

```jsx
/**
 * title: 堆叠+分组
 */
import React, { useState, useEffect } from 'react';
import { ColumnPro, request } from 'fintech';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    request('/charts/column.json').then((res) => {
      setData(res);
    });
  }, []);

  return (
    <ColumnPro
      data={data}
      fields={['product_type', 'order_amt', 'product_sub_type', 'sex']}
      tooltipItems={[
        (d) => ({
          name: `${d.product_sub_type}-${d.sex}`,
          value: d.order_amt,
        }),
      ]}
    />
  );
};
```

### API

| 参数           | 说明                       | 类型                                                | 默认值 |
| :------------- | :------------------------- | :-------------------------------------------------- | :----- |
| height         | 图表高度                   | number                                              | 500    |
| fields         | 字段映射                   | `['xField', 'yField', 'colorField', 'seriesField']` |        |
| xAxisFormatter | x 轴刻度值线格式化         | (datum, index, data, Vector) => DisplayObject       |        |
| yAxisFormatter | y 轴刻度值线格式化         | (datum, index, data, Vector) => DisplayObject       |        |
| tooltipTitle   | 提示器标题                 | (data) => ReactNode                                 |        |
| tooltipItems   | 提示词对应 items 内容      | TooltipItem[]                                       |        |
| group          | 是否分组, 依赖 `fields[2]` | boolean                                             |        |
| stack          | 是否堆叠，依赖 `fields[2]` | boolean                                             |        |
