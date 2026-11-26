---
group: 图表
title: ChartFilterDrawer
order: 7
---

# ChartFilterDrawer

图表过滤抽屉组件，用于对图表数据进行分类筛选。支持按颜色字段分类、搜索过滤、全选/取消全选等功能。

## 颜色生成

ChartFilterDrawer 的颜色生成逻辑与 [@ant-design/plots](https://ant-design-charts.antgroup.com/) 完全一致，确保筛选器中的颜色与图表中的颜色完全匹配。

- 当分类数量 ≤ 10 时，使用 `category10` 调色板（10 种颜色）
- 当分类数量 > 10 时，使用 `category20` 调色板（20 种颜色）
- 颜色按分类在数据中的顺序分配，相同分类值始终获得相同颜色
- 当分类数量超过调色板大小时，颜色会循环使用

## 代码演示

```jsx
/**
 * title: 与 BarPro 配合使用
 */
import React from 'react';
import { ChartFilterDrawer, BarPro } from 'fintech';

const data = [
  { name: '一月', value: 100, category: '电子产品' },
  { name: '二月', value: 200, category: '电子产品' },
  { name: '三月', value: 150, category: '服装' },
  { name: '四月', value: 300, category: '服装' },
  { name: '五月', value: 250, category: '食品' },
  { name: '六月', value: 180, category: '食品' },
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

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { ChartFilterDrawer } from 'fintech';

const data = [
  { name: '一月', value: 100, category: '电子产品' },
  { name: '二月', value: 200, category: '电子产品' },
  { name: '三月', value: 150, category: '服装' },
  { name: '四月', value: 300, category: '服装' },
  { name: '五月', value: 250, category: '食品' },
  { name: '六月', value: 180, category: '食品' },
];

export default () => {
  return (
    <ChartFilterDrawer data={data} colorField="category">
      {(filteredData) => (
        <div style={{ padding: '40px' }}>
          <h3>筛选后的数据：</h3>
          <pre>{JSON.stringify(filteredData, null, 2)}</pre>
        </div>
      )}
    </ChartFilterDrawer>
  );
};
```

```jsx
/**
 * title: 自定义触发按钮
 */
import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ChartFilterDrawer } from 'fintech';

const data = [
  { name: '产品A', value: 100, type: '类型1' },
  { name: '产品B', value: 200, type: '类型2' },
  { name: '产品C', value: 150, type: '类型3' },
];

const customTrigger = (
  <Button type="primary" icon={<SettingOutlined />}>
    筛选设置
  </Button>
);

export default () => {
  return (
    <ChartFilterDrawer data={data} colorField="type" trigger={customTrigger}>
      {(filteredData) => (
        <div style={{ padding: '40px' }}>
          <h3>数据列表：</h3>
          {filteredData.map((item) => (
            <div key={item.name}>
              {item.name}: {item.value} ({item.type})
            </div>
          ))}
        </div>
      )}
    </ChartFilterDrawer>
  );
};
```

```jsx
/**
 * title: 控制初始显示的个数
 */
import React from 'react';
import { ChartFilterDrawer } from 'fintech';

const data = [
  { name: '北京', value: 1000, region: '华北' },
  { name: '上海', value: 1200, region: '华东' },
  { name: '广州', value: 800, region: '华南' },
  { name: '深圳', value: 900, region: '华南' },
];

export default () => {
  return (
    <ChartFilterDrawer data={data} colorField="region" initialVisibleCount={0}>
      {(filteredData) => (
        <div style={{ padding: '40px' }}>
          <h3>选中 {filteredData.length} 条数据</h3>
          {filteredData.length === 0 && <p>请从右上角打开筛选器选择分类</p>}
          {filteredData.map((item) => (
            <div key={item.name}>
              {item.name}: {item.value} ({item.region})
            </div>
          ))}
        </div>
      )}
    </ChartFilterDrawer>
  );
};
```

```jsx
/**
 * title: 自定义抽屉属性
 */
import React from 'react';
import { ChartFilterDrawer } from 'fintech';

const data = [
  { name: '项目1', value: 100, status: '进行中' },
  { name: '项目2', value: 200, status: '已完成' },
  { name: '项目3', value: 150, status: '进行中' },
  { name: '项目4', value: 300, status: '待开始' },
];

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
      {(filteredData) => (
        <div style={{ padding: '40px' }}>
          <h3>项目列表：</h3>
          {filteredData.map((item) => (
            <div key={item.name}>
              {item.name}: {item.value} - {item.status}
            </div>
          ))}
        </div>
      )}
    </ChartFilterDrawer>
  );
};
```

```jsx
/**
 * title: 性能测试（大数据量）
 * description: 测试组件在大数据量下的性能表现
 */
import React, { useMemo } from 'react';
import { ChartFilterDrawer, LinePro } from 'fintech';

export default () => {
  const data = useMemo(() => {
    const categories = Array.from({ length: 600 }, (_, i) => `分类${i + 1}`);
    const items = [];

    for (let i = 0; i < 1500; i++) {
      const categoryIndex = i % categories.length;
      items.push({
        name: `数据点${i + 1}`,
        value: Math.floor(Math.random() * 1000),
        category: categories[categoryIndex],
      });
    }

    return items;
  }, []);

  return (
    <ChartFilterDrawer
      data={data}
      colorField="category"
      initialVisibleCount={10}
      drawerProps={{
        title: '性能测试（1500 条数据，600 个分类）',
        size: 600,
      }}
    >
      {(filteredData) => (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <strong>当前选中：</strong>
            {filteredData.length} 条数据
          </div>
          <LinePro
            data={filteredData}
            fields={['name', 'value', 'category']}
            height={400}
          />
        </div>
      )}
    </ChartFilterDrawer>
  );
};
```

## API

| 参数                  | 说明                       | 类型                                                             | 默认值   |
| --------------------- | -------------------------- | ---------------------------------------------------------------- | -------- |
| `data`                | 图表数据数组               | `any[]`                                                          | -        |
| `colorField`          | 用于分类的字段名           | `string`                                                         | -        |
| `children`            | 渲染函数，接收过滤后的数据 | `(filteredData: any[], categories: string[]) => React.ReactNode` | -        |
| `trigger`             | 自定义触发按钮             | `React.ReactNode`                                                | 默认按钮 |
| `initialVisibleCount` | 初始显示的分类个数         | `number`                                                         | `999`    |
| `style`               | 容器样式                   | `React.CSSProperties`                                            | -        |
| `className`           | 容器类名                   | `string`                                                         | -        |
| `drawerProps`         | 传递给 DrawerBox 的属性    | `any`                                                            | -        |
