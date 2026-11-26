---
name: 'ChartFilterDrawer'
description: 'Provides usage guide and code examples for ChartFilterDrawer component. Invoke when user needs to use ChartFilterDrawer for chart data filtering with category selection, search, and toggle all functionality.'
---

# ChartFilterDrawer

ChartFilterDrawer 是一个图表过滤抽屉组件，用于对图表数据进行分类筛选。

## 功能特性

- 按颜色字段对数据进行分类
- 支持搜索过滤分类
- 支持全选/取消全选
- 自定义触发按钮
- 可配置默认选中状态
- 集成 DrawerBox 组件
- **颜色生成与 @ant-design/plots 完全一致**，确保筛选器与图表颜色匹配

## 颜色生成

ChartFilterDrawer 的颜色生成逻辑与 [@ant-design/plots](https://charts.ant.design/) 完全一致：

- 当分类数量 ≤ 10 时，使用 `category10` 调色板（10 种颜色）
- 当分类数量 > 10 时，使用 `category20` 调色板（20 种颜色）
- 颜色按分类在数据中的顺序分配，相同分类值始终获得相同颜色
- 当分类数量超过调色板大小时，颜色会循环使用

**调色板颜色：**

**category10（10 色）：**

- #1783FF, #00C9C9, #F0884D, #D580FF, #7863FF
- #60C42D, #BD8F24, #FF80CA, #2491B3, #17C76F

**category20（20 色）：**

- #1783FF, #00C9C9, #F0884D, #D580FF, #7863FF
- #60C42D, #BD8F24, #FF80CA, #2491B3, #17C76F
- #AABA01, #BC7CFC, #237CBC, #2DE379, #CE8032
- #FF7AF4, #545FD3, #AFE410, #D8C608, #FFA1E0

## 基础用法

```jsx
import { ChartFilterDrawer } from 'fintech';

<ChartFilterDrawer
  data={data}
  colorField="category"
>
  {(filteredData) => (
    // 使用过滤后的数据渲染图表
  )}
</ChartFilterDrawer>
```

## 使用场景

- 图表数据分类筛选
- 数据可视化过滤
- 多维度数据展示
- 动态数据过滤

## 代码示例

### 与图表配合使用

```jsx
import React from 'react';
import { ChartFilterDrawer, BarPro } from 'fintech';

const data = [
  { name: '一月', value: 100, category: '电子产品' },
  { name: '二月', value: 200, category: '电子产品' },
  { name: '三月', value: 150, category: '服装' },
  { name: '四月', value: 300, category: '服装' },
];

export default () => {
  return (
    <ChartFilterDrawer data={data} colorField="category">
      {(filteredData) => (
        <BarPro data={filteredData} fields={['name', 'value', 'category']} />
      )}
    </ChartFilterDrawer>
  );
};
```

### 基础用法

```jsx
import React from 'react';
import { ChartFilterDrawer } from 'fintech';

const data = [
  { name: '一月', value: 100, category: '电子产品' },
  { name: '二月', value: 200, category: '电子产品' },
  { name: '三月', value: 150, category: '服装' },
];

export default () => {
  return (
    <ChartFilterDrawer data={data} colorField="category">
      {(filteredData) => (
        <div>
          {filteredData.map((item) => (
            <div key={item.name}>
              {item.name}: {item.value}
            </div>
          ))}
        </div>
      )}
    </ChartFilterDrawer>
  );
};
```

### 自定义触发按钮

```jsx
import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ChartFilterDrawer } from 'fintech';

const customTrigger = (
  <Button type="primary" icon={<SettingOutlined />}>
    筛选设置
  </Button>
);

export default () => {
  return (
    <ChartFilterDrawer data={data} colorField="type" trigger={customTrigger}>
      {(filteredData) => <div>{/* 渲染过滤后的数据 */}</div>}
    </ChartFilterDrawer>
  );
};
```

### 默认不选中

```jsx
import React from 'react';
import { ChartFilterDrawer } from 'fintech';

export default () => {
  return (
    <ChartFilterDrawer data={data} colorField="region" defaultVisible={false}>
      {(filteredData) => <div>{/* 用户需要手动选择分类 */}</div>}
    </ChartFilterDrawer>
  );
};
```

### 自定义抽屉属性

```jsx
import React from 'react';
import { ChartFilterDrawer } from 'fintech';

export default () => {
  return (
    <ChartFilterDrawer
      data={data}
      colorField="status"
      drawerProps={{
        title: '项目状态筛选',
        size: 300,
        placement: 'left',
      }}
    >
      {(filteredData) => <div>{/* 渲染过滤后的数据 */}</div>}
    </ChartFilterDrawer>
  );
};
```

## API

| 参数             | 说明                       | 类型                                       | 默认值   |
| ---------------- | -------------------------- | ------------------------------------------ | -------- |
| `data`           | 图表数据数组               | `any[]`                                    | -        |
| `colorField`     | 用于分类的字段名           | `string`                                   | -        |
| `children`       | 渲染函数，接收过滤后的数据 | `(filteredData: any[]) => React.ReactNode` | -        |
| `trigger`        | 自定义触发按钮             | `React.ReactNode`                          | 默认按钮 |
| `defaultVisible` | 是否默认选中所有分类       | `boolean`                                  | `true`   |
| `style`          | 容器样式                   | `React.CSSProperties`                      | -        |
| `className`      | 容器类名                   | `string`                                   | -        |
| `drawerProps`    | 传递给 DrawerBox 的属性    | `any`                                      | -        |

## 注意事项

- `colorField` 必须是 `data` 数组中每个对象都存在的字段
- `children` 是一个渲染函数，接收过滤后的数据作为参数
- 组件内部使用 `Set` 来管理选中的分类，保证唯一性
- 搜索功能会对分类名称进行大小写不敏感的匹配
- **颜色生成与 @ant-design/plots 完全一致**，确保筛选器与图表的颜色匹配
- 相同的分类值始终获得相同的颜色，无论数据顺序如何
- 当分类数量超过调色板大小时，颜色会循环使用
