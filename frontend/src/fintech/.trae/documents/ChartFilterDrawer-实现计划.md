# ChartFilterDrawer 组件实现计划

## 设计理念

采用 **组合模式** 和 **受控组件** 的设计理念，创建一个外壳组件，通过抽屉提供数据筛选功能，将筛选后的数据传递给子组件。这种方式：

- ✅ **零侵入性** - 不修改现有的 LinePro、BarPro、ColumnPro 组件
- ✅ **保持原生 Legend** - 图表组件的原生 Legend 功能完全保留
- ✅ **灵活组合** - 开发者可以自由组合不同的图表组件
- ✅ **易于使用** - 简单的 API，开箱即用

## 核心设计

### 组件结构

```
ChartFilterDrawer (外壳组件)
├── Drawer (抽屉容器)
│   ├── FilterPanel (筛选面板)
│   │   ├── SearchInput (搜索框)
│   │   ├── SelectAllButton (全选/反选按钮)
│   │   └── LegendItemList (图例项列表)
│   └── Footer (底部操作按钮)
└── Children (子组件，接收筛选后的数据)
```

### 数据流

```
原始数据 → ChartFilterDrawer → 抽屉操作 → 筛选后的数据 → children(data)
```

## API 设计

### ChartFilterDrawer Props

```typescript
interface ChartFilterDrawerProps {
  data: any[]; // 原始数据
  colorField: string; // 颜色字段（用于分类）
  children: (filteredData: any[]) => React.ReactNode; // 渲染函数
  trigger?: React.ReactNode; // 触发器（打开抽屉的按钮）
  triggerPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  drawerTitle?: string; // 抽屉标题
  drawerWidth?: number | string; // 抽屉宽度
  showSearch?: boolean; // 显示搜索框
  showSelectAll?: boolean; // 显示全选按钮
  maxShow?: number; // 最大显示数量
  defaultVisible?: boolean; // 默认是否显示所有分类
  onFilterChange?: (filteredData: any[]) => void; // 筛选变化回调
  style?: React.CSSProperties; // 自定义样式
  className?: string; // 自定义类名
}
```

### 使用示例

```typescript
import { ChartFilterDrawer } from '@/Charts';
import { LinePro } from '@/Charts/Line';

// 基础用法
<ChartFilterDrawer
  data={data}
  colorField="category"
>
  {(filteredData) => (
    <LinePro
      data={filteredData}
      fields={['year', 'value', 'category']}
    />
  )}
</ChartFilterDrawer>

// 自定义触发器
<ChartFilterDrawer
  data={data}
  colorField="category"
  trigger={
    <Button type="primary">
      <FilterOutlined /> 筛选数据
    </Button>
  }
>
  {(filteredData) => (
    <LinePro
      data={filteredData}
      fields={['year', 'value', 'category']}
    />
  )}
</ChartFilterDrawer>

// 高级配置
<ChartFilterDrawer
  data={data}
  colorField="category"
  triggerPosition="top-right"
  drawerTitle="数据筛选"
  drawerWidth={400}
  showSearch={true}
  showSelectAll={true}
  maxShow={20}
  onFilterChange={(filteredData) => {
    console.log('筛选后的数据:', filteredData);
  }}
>
  {(filteredData) => (
    <LinePro
      data={filteredData}
      fields={['year', 'value', 'category']}
    />
  )}
</ChartFilterDrawer>
```

## 实现步骤

### 阶段一：创建基础组件

#### 1. 创建 ChartFilterDrawer 组件

**文件路径：** `/src/Charts/ChartFilterDrawer/index.tsx`

**核心功能：**

- 使用 antd 的 Drawer 组件作为容器
- 集成搜索、全选、图例列表等功能
- 管理筛选状态
- 将筛选后的数据传递给 children

**状态管理：**

```typescript
const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
const [searchKeyword, setSearchKeyword] = useState<string>('');
const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
```

**核心逻辑：**

```typescript
// 获取所有唯一的分类值
const uniqueCategories = useMemo(() => {
  return Array.from(new Set(data.map((item) => item[colorField])));
}, [data, colorField]);

// 过滤后的数据
const filteredData = useMemo(() => {
  if (visibleItems.size === 0) return [];
  return data.filter((item) => visibleItems.has(item[colorField]));
}, [data, colorField, visibleItems]);

// 搜索后的图例项
const filteredLegendItems = useMemo(() => {
  if (!searchKeyword) return uniqueCategories;
  return uniqueCategories.filter((category) =>
    category.toLowerCase().includes(searchKeyword.toLowerCase()),
  );
}, [uniqueCategories, searchKeyword]);
```

#### 2. 创建类型定义

**文件路径：** `/src/Charts/ChartFilterDrawer/types.ts`

```typescript
export interface ChartFilterDrawerProps {
  data: any[];
  colorField: string;
  children: (filteredData: any[]) => React.ReactNode;
  trigger?: React.ReactNode;
  triggerPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  drawerTitle?: string;
  drawerWidth?: number | string;
  showSearch?: boolean;
  showSelectAll?: boolean;
  maxShow?: number;
  defaultVisible?: boolean;
  onFilterChange?: (filteredData: any[]) => void;
  style?: React.CSSProperties;
  className?: string;
}

export interface FilterPanelProps {
  categories: string[];
  visibleItems: Set<string>;
  onToggleItem: (category: string) => void;
  onToggleAll: (visible: boolean) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  showSearch?: boolean;
  showSelectAll?: boolean;
  maxShow?: number;
}
```

#### 3. 创建 FilterPanel 子组件

**文件路径：** `/src/Charts/ChartFilterDrawer/FilterPanel.tsx`

**功能：**

- 渲染搜索框
- 渲染全选/反选按钮
- 渲染图例项列表
- 支持颜色标识

### 阶段二：导出和集成

#### 1. 更新 Charts 入口文件

**文件路径：** `/src/Charts/index.ts`

```typescript
export { default as LinePro } from './Line';
export { default as BarPro } from './Bar';
export { default as ColumnPro } from './Column';
export { default as ChartFilterDrawer } from './ChartFilterDrawer';
```

#### 2. 更新项目主入口文件

**文件路径：** `/src/index.ts`

```typescript
export { LinePro, BarPro, ColumnPro, ChartFilterDrawer } from './Charts';
```

### 阶段三：文档和示例

#### 1. 创建使用文档

**文件路径：** `/docs/charts/ChartFilterDrawer.md`

内容包括：

- 组件介绍
- 基础用法
- 高级配置
- API 文档
- 最佳实践

#### 2. 创建使用示例

**文件路径：** `/docs/charts/examples/ChartFilterDrawerExample.tsx`

示例包括：

- 基础用法
- 自定义触发器
- 大数据量场景
- 与不同图表组件组合

## 核心代码结构

```
src/Charts/
├── ChartFilterDrawer/
│   ├── index.tsx           # ChartFilterDrawer 主组件
│   ├── FilterPanel.tsx     # 筛选面板子组件
│   └── types.ts            # 类型定义
├── Line/
│   └── index.tsx           # 保持不变
├── Bar/
│   └── index.tsx           # 保持不变
├── Column/
│   └── index.tsx           # 保持不变
└── index.ts                # 导出 ChartFilterDrawer
```

## 技术要点

### 1. 颜色生成

使用 HSL 颜色空间生成区分度高的颜色：

```typescript
const getCategoryColor = (category: string, index: number) => {
  const hash = category.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const hue = (hash * 137.5) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};
```

### 2. 性能优化

- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 优化事件处理函数
- 大数据量时考虑虚拟滚动

### 3. 用户体验

- 默认显示所有分类
- 提供快捷全选/反选
- 支持实时搜索
- 显示选中数量统计

### 4. 样式设计

- 使用 antd 的主题变量
- 响应式布局
- 支持自定义样式

## 优势对比

### 原方案（侵入式）

❌ 需要修改 LinePro、BarPro、ColumnPro 组件
❌ 需要隐藏原生 Legend
❌ 代码耦合度高
❌ 难以维护和扩展

### 新方案（组合式）

✅ 零侵入性，不修改现有组件
✅ 保留原生 Legend 功能
✅ 代码解耦，易于维护
✅ 灵活组合，支持任意图表组件
✅ 符合 React 设计理念
✅ 易于测试

## 使用场景

### 1. 基础图表筛选

```typescript
<ChartFilterDrawer data={data} colorField="category">
  {(filteredData) => (
    <LinePro data={filteredData} fields={['year', 'value', 'category']} />
  )}
</ChartFilterDrawer>
```

### 2. 多图表联动

```typescript
<ChartFilterDrawer data={data} colorField="category">
  {(filteredData) => (
    <>
      <LinePro data={filteredData} fields={['year', 'value', 'category']} />
      <BarPro data={filteredData} fields={['year', 'value', 'category']} />
    </>
  )}
</ChartFilterDrawer>
```

### 3. 自定义布局

```typescript
<div style={{ display: 'flex', gap: '20px' }}>
  <ChartFilterDrawer data={data} colorField="category">
    {(filteredData) => (
      <LinePro data={filteredData} fields={['year', 'value', 'category']} />
    )}
  </ChartFilterDrawer>
  <ChartFilterDrawer data={data} colorField="region">
    {(filteredData) => (
      <BarPro data={filteredData} fields={['year', 'value', 'region']} />
    )}
  </ChartFilterDrawer>
</div>
```

## 注意事项

1. **数据类型安全** - 确保 `colorField` 在数据中存在
2. **性能考虑** - 大数据量时使用虚拟滚动
3. **样式适配** - 确保与现有 UI 风格一致
4. **国际化** - 预留 i18n 接口
5. **无障碍访问** - 支持键盘操作和屏幕阅读器

## 测试计划

1. **单元测试**

   - FilterPanel 组件测试
   - 筛选逻辑测试
   - 搜索功能测试

2. **集成测试**

   - 与 LinePro 集成测试
   - 与 BarPro 集成测试
   - 与 ColumnPro 集成测试

3. **性能测试**

   - 大数据量测试（1000+ 条数据）
   - 大分类量测试（100+ 个分类）

4. **兼容性测试**
   - 不同浏览器测试
   - 不同屏幕尺寸测试

## 未来扩展

1. **高级筛选**

   - 支持多字段组合筛选
   - 支持范围筛选
   - 支持自定义筛选条件

2. **数据统计**

   - 显示每个分类的数据量
   - 显示每个分类的汇总值
   - 支持排序功能

3. **导出功能**

   - 导出筛选后的数据
   - 导出筛选配置

4. **持久化**
   - 保存筛选配置
   - 恢复上次筛选状态

## 总结

这个方案通过组合模式实现了数据筛选功能，具有以下特点：

- ✅ **零侵入** - 不修改现有组件
- ✅ **高复用** - 可与任意图表组件组合
- ✅ **易维护** - 代码解耦，职责清晰
- ✅ **易扩展** - 支持未来功能扩展
- ✅ **符合规范** - 遵循 React 最佳实践

这是一个优雅、高效、可维护的解决方案！
