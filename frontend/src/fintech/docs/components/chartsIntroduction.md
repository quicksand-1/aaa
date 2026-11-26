---
group: 图表
title: 介绍
order: 1
---

封装 [Ant Design Charts](https://ant-design-charts.antgroup.com/) 使其有更简洁的 API，能满足大部分的应用场景

### FAQ

1. [tooltipItems](https://ant-design-charts.antgroup.com/options/plots/tooltip#item) 有哪些写法？

   ```jsx | pure
   tooltipItems: [
     {
       field: 'value',
       valueFormatter: (v) => `${(+v / 100000000).toFixed(6)}亿`,
     },
     // d：每一个数据项
     // index：索引
     // data：完整数据
     // column：通道
     (d, index, data, column) => ({
       name: `${d.product_sub_type}-${d.sex}`,
       value: d.order_amt,
     }),
   ];
   ```

2. Line 组件 [slice](https://github.com/ant-design/ant-design-charts/issues/3028) 报错

   ```
   Maximum recursion depth reached in equalizeSegments
   TypeError: Cannot read properties of undefined (reading 'slice')
   ```

   - 解决方案：给 Line 加 key
