# 图表 Legend 优化方案

## 问题分析

当前 `/src/Charts` 目录下的图表组件（Line、Bar、Column、Base）使用 `@ant-design/plots` 库，当数据中的分类特别多且名字很长时，legend 无法很好展示，用户难以进行分类筛选操作。

**主要问题：**

1. 图例项过多导致显示区域拥挤
2. 长文本被截断，无法完整显示
3. 缺少搜索/筛选功能，难以快速定位目标分类
4. 缺少批量操作功能（全选/反选）
5. 无法灵活控制图例的显示/隐藏

## 解决方案

### 方案概述

创建一个智能的 Legend 组件，集成到现有图表中，提供以下功能：

1. **搜索/筛选功能** - 支持实时搜索图例项
2. **分页显示** - 处理大量图例项，可配置最大显示数量
3. **批量操作** - 全选/反选/显示/隐藏
4. **灵活布局** - 支持内嵌和外部两种模式
5. **响应式设计** - 根据屏幕空间自动调整

### 技术方案

#### 1. 创建 ChartLegend 组件

**文件路径：** `/src/Charts/ChartLegend/index.tsx`

**核心功能：**

- 基于 antd 的 Checkbox 组件
- 支持搜索/筛选图例项
- 支持全选/反选
- 支持显示/隐藏单个或多个图例项
- 支持自定义渲染

**API 设计：**

```typescript
interface ChartLegendProps {
  items: Array<{
    id: string;
    name: string;
    color: string;
    value?: number;
    visible?: boolean;
  }>;
  onChange?: (visibleItems: string[]) => void;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'inline';
  searchable?: boolean;
  maxShow?: number;
  showSelectAll?: boolean;
  showSearch?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
```

#### 2. 集成到现有图表组件

修改以下文件，添加 legend 配置支持：

- `/src/Charts/Line/index.tsx`
- `/src/Charts/Bar/index.tsx`
- `/src/Charts/Column/index.tsx`
- `/src/Charts/Base/index.tsx`

**集成方式：**

1. 添加 `legendProps` 属性，类型为 `ChartLegendConfig | false`
2. 当 `legendProps` 不是 `false` 且 `fields[2]`（colorField）存在时，启用自定义 Legend
3. 隐藏原生 legend（`legend: false`）
4. 使用 ChartLegend 组件控制数据过滤

#### 3. 数据过滤逻辑

创建一个 Hook 来管理图例状态和数据过滤：

**文件路径：** `/src/Charts/hooks/useChartLegend.ts`

**功能：**

- 管理图例项的显示/隐藏状态
- 根据选中的图例项过滤原始数据
- 提供全选/反选功能
- 提供搜索/筛选功能

### 实现步骤

#### 阶段一：创建基础组件

1. **创建 ChartLegend 组件**

   - 实现基础的图例列表渲染
   - 支持点击切换显示/隐藏
   - 支持全选/反选

2. **创建 useChartLegend Hook**

   - 管理图例状态
   - 实现数据过滤逻辑

3. **创建类型定义**
   - 定义 ChartLegend 相关的 TypeScript 类型

#### 阶段二：集成到图表组件

1. **修改 Line 组件**

   - 添加 `legendProps` 属性（类型为 `ChartLegendConfig | false`）
   - 集成 useChartLegend Hook
   - 添加 ChartLegend 组件
   - 判断逻辑：`const enableCustomLegend = !!legendProps && fields[2]`

2. **修改 Bar 组件**

   - 同 Line 组件

3. **修改 Column 组件**

   - 同 Line 组件

4. **修改 Base 组件**
   - 同 Line 组件
   - 判断逻辑：`const enableCustomLegend = !!legendProps && (colorField || items[0]?.fields?.[2])`

#### 阶段三：文档和示例

1. **创建使用示例**

   - 基础用法示例
   - 自定义图例示例
   - 大数据量场景示例（100+个分类）
   - 禁用自定义图例示例

2. **编写 API 文档**
   - ChartLegend 组件 API
   - 各图表组件新增属性说明

### 核心代码结构

```
src/Charts/
├── ChartLegend/
│   ├── index.tsx           # ChartLegend 主组件
│   └── types.ts            # 类型定义
├── hooks/
│   └── useChartLegend.ts   # 图例管理 Hook
├── Line/
│   └── index.tsx           # 修改：添加 legendProps 支持
├── Bar/
│   └── index.tsx           # 修改：添加 legendProps 支持
├── Column/
│   └── index.tsx           # 修改：添加 legendProps 支持
└── Base/
    └── index.tsx           # 修改：添加 legendProps 支持
```

### 使用示例

```typescript
import { Line } from '@/Charts';

// 启用自定义图例
<Line
  data={data}
  fields={['year', 'value', 'category']}
  legendProps={{
    showSearch: true,
    showSelectAll: true,
    maxShow: 10,
    position: 'top',
  }}
/>

// 禁用自定义图例（使用原生 legend）
<Line
  data={data}
  fields={['year', 'value', 'category']}
  legendProps={false}
/>

// 不传 legendProps，使用原生 legend
<Line
  data={data}
  fields={['year', 'value', 'category']}
/>
```

### API 设计

#### ChartLegendConfig

| 参数          | 说明         | 类型                                                 | 默认值  |
| :------------ | :----------- | :--------------------------------------------------- | :------ |
| position      | 图例位置     | `'top' \| 'right' \| 'bottom' \| 'left' \| 'inline'` | `'top'` |
| showSearch    | 显示搜索框   | boolean                                              | false   |
| showSelectAll | 显示全选按钮 | boolean                                              | true    |
| maxShow       | 最大显示数量 | number                                               |         |
| searchable    | 是否可搜索   | boolean                                              | false   |
| style         | 自定义样式   | React.CSSProperties                                  |         |
| className     | 自定义类名   | string                                               |         |

**使用规则：**

- 当 `legendProps` 为 `false` 时，禁用自定义图例，使用原生图例
- 当 `legendProps` 为 `undefined` 或不传时，使用原生图例
- 当 `legendProps` 为配置对象且 `fields[2]`（colorField）存在时，启用自定义图例

### 优势

1. **简洁的 API** - 只需要一个 `legendProps` 属性
2. **严谨的判断** - 只有在 `legendProps` 存在且 `fields[2]` 存在时才启用
3. **复用现有组件** - 利用已有的 antd 组件
4. **向后兼容** - 不影响现有代码，通过可选属性启用
5. **灵活配置** - 支持多种布局和功能组合
6. **类型安全** - 完整的 TypeScript 支持
7. **易于维护** - 清晰的代码结构和职责分离

### 大数据量场景优势

当分类特别多（100+个）时，自定义图例的优势：

- ✅ **搜索功能** - 快速定位目标分类，支持实时搜索
- ✅ **分页显示** - 避免图例区域拥挤，可配置最大显示数量
- ✅ **批量操作** - 全选/反选，快速筛选
- ✅ **长文本处理** - Tooltip 完整显示，避免截断
- ✅ **灵活布局** - 支持多种位置和样式自定义

### 注意事项

1. 需要确保数据过滤逻辑正确，不影响图表的其他功能
2. 性能优化：大量数据时使用虚拟滚动
3. 样式适配：确保与现有图表样式一致
4. 国际化支持：预留 i18n 接口

### 测试计划

1. 单元测试：测试 useChartLegend Hook 的各种场景
2. 集成测试：测试与各图表组件的集成
3. 性能测试：测试大量图例项时的性能
4. 兼容性测试：测试不同浏览器的兼容性

### 文档

- [LinePro.md](../../docs/charts/LinePro.md) - Line 组件使用文档，包含自定义图例示例
