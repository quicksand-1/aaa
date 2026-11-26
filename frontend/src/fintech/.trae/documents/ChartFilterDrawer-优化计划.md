# ChartFilterDrawer 优化计划

## 优化目标

对 ChartFilterDrawer 组件进行以下优化：

1. 筛选数据按钮可以用 icon 代替
2. 不需要 Badge
3. 全选和清空按钮有重复功能，可以只保留左侧按钮
4. 搜索功能可以放在现在全选和清空的位置
5. 移除没有使用的变量或函数

## 优化详情

### 1. index.tsx 优化

#### 1.1 移除 Badge 组件

- 移除 `Badge` 导入
- 移除 `triggerWithBadge` 变量
- 直接使用 `trigger || defaultTrigger`

#### 1.2 简化触发器按钮

- 将"筛选数据"文字按钮改为只显示 icon
- 使用 `icon={<FilterOutlined />}` 作为触发器
- 移除按钮文字

#### 1.3 移除未使用的变量和函数

检查并移除以下未使用的项：

- `drawerTitle` - 未使用
- `drawerWidth` - 未使用
- `okText` - 未使用
- `cancelText` - 未使用
- `onOk` - 未使用
- `onCancel` - 未使用
- `footer` - 未使用
- `okButtonProps` - 未使用
- `handleFilterChange` - 未使用
- `handleCancel` - 未使用

#### 1.4 简化 DrawerBox 配置

- 移除未使用的 props
- 保持必要的配置：`actionRef`, `closeIcon`

### 2. FilterPanel.tsx 优化

#### 2.1 移除重复的全选/清空按钮

- 移除右侧的 `全选` 和 `清空` 按钮
- 保留左侧的"全选"文本按钮
- 点击左侧按钮可以切换全选/取消全选

#### 2.2 调整搜索框位置

- 将搜索框移到全选按钮的右侧
- 使用 `Space` 组件布局
- 保持搜索框在顶部区域

#### 2.3 移除未使用的变量和函数

- `someChecked` - 未使用，移除

#### 2.4 优化布局结构

```
顶部区域：
[全选 (x/y)] [搜索框]
---
分类列表区域
```

## 实施步骤

### 步骤 1：优化 index.tsx

1. 移除 Badge 导入
2. 移除 triggerWithBadge 变量
3. 简化 defaultTrigger 为纯 icon 按钮
4. 移除未使用的 props 和函数
5. 简化 DrawerBox 配置

### 步骤 2：优化 FilterPanel.tsx

1. 移除右侧的全选/清空按钮
2. 移除 someChecked 变量
3. 调整搜索框位置到全选按钮右侧
4. 优化顶部布局结构

### 步骤 3：更新类型定义

检查 types.ts 是否需要调整（如果需要）

## 预期效果

### 优化前

- 触发器：带文字的按钮 + Badge 显示数量
- FilterPanel 顶部：全选文本 + 全选/清空按钮 + 搜索框（独立）

### 优化后

- 触发器：纯 icon 按钮
- FilterPanel 顶部：全选文本 + 搜索框（紧凑布局）

## 代码变更概览

### index.tsx 变更

- 移除：`Badge`, `triggerWithBadge`, `handleFilterChange`, `handleCancel`
- 简化：`defaultTrigger` 为纯 icon
- 清理：未使用的 props

### FilterPanel.tsx 变更

- 移除：`someChecked`, 右侧按钮组
- 调整：搜索框位置
- 优化：顶部布局结构
