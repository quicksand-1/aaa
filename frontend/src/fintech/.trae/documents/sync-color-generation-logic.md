# 同步 @ant-design/plots 颜色生成逻辑到 ChartFilterDrawer

## 背景

当前 ChartFilterDrawer 组件中的 FilterPanel 使用自定义的 `getCategoryColor` 函数生成颜色，该函数使用简单的哈希算法生成 HSL 颜色。但是，ChartFilterDrawer 通常与 @ant-design/plots 组件（BarPro、LinePro、ColumnPro）一起使用，这些组件使用 `colorField` 属性来指定颜色字段，由 @ant-design/plots 内部自动生成颜色。

为了保持颜色的一致性，需要将 @ant-design/plots 的颜色生成逻辑同步到 ChartFilterDrawer 中。

## 目标

1. 研究 @ant-design/plots 组件的颜色生成逻辑
2. 将 @ant-design/plots 的颜色生成逻辑同步到 ChartFilterDrawer 的 FilterPanel 组件中
3. 确保 ChartFilterDrawer 生成的颜色与 @ant-design/plots 生成的颜色一致
4. 保持代码的可维护性和可扩展性

## 分析

### 当前实现

ChartFilterDrawer 的 FilterPanel 组件使用以下颜色生成逻辑：

```typescript
const getCategoryColor = (category: string, index: number) => {
  const hash = String(category)
    .split('')
    .reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
  const hue = (hash * 137.5) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};
```

### @ant-design/plots 的颜色生成

从现有代码分析：

- BarPro、LinePro、ColumnPro 都使用 `colorField: fields[2]` 来指定颜色字段
- @ant-design/plots 会根据 colorField 的值自动分配颜色
- 颜色分配通常是确定性的，相同的分类值会得到相同的颜色

### 需要研究的内容

1. @ant-design/plots 的默认调色板
2. 颜色分配算法（基于索引还是基于哈希）
3. 颜色格式（RGB、HSL、Hex）
4. 是否支持自定义颜色

## 实施计划

### 步骤 1：研究 @ant-design/plots 颜色生成逻辑

- 查看 @ant-design/plots 的官方文档
- 查看 @ant-design/plots 的源码（如果可能）
- 分析现有图表组件的使用方式
- 确定颜色生成的具体算法

### 步骤 2：实现颜色生成函数

- 在 ChartFilterDrawer 中创建与 @ant-design/plots 一致的颜色生成函数
- 支持相同的调色板
- 支持相同的颜色分配逻辑
- 确保相同的分类值得到相同的颜色

### 步骤 3：更新 FilterPanel 组件

- 替换现有的 `getCategoryColor` 函数
- 使用新的颜色生成逻辑
- 保持向后兼容性（如果需要）
- 更新相关类型定义

### 步骤 4：测试验证

- 测试不同分类的颜色生成
- 验证与 @ant-design/plots 图表的颜色一致性
- 测试边界情况（大量分类、特殊字符等）
- 确保视觉效果符合预期

### 步骤 5：更新文档

- 更新 ChartFilterDrawer 组件文档
- 说明颜色生成逻辑
- 提供自定义颜色的示例（如果支持）
- 更新 API 文档

## 预期成果

1. ChartFilterDrawer 的颜色与 @ant-design/plots 图表的颜色完全一致
2. 用户在使用 ChartFilterDrawer 和图表组件时，能够看到一致的颜色映射
3. 代码更加规范和可维护
4. 文档完整，用户能够理解颜色生成逻辑

## 风险与注意事项

1. @ant-design/plots 的颜色生成逻辑可能比较复杂，需要充分理解
2. 可能需要处理颜色循环（当分类数量超过调色板大小时）
3. 需要确保性能不受影响
4. 需要考虑向后兼容性

## 时间估算

- 研究 @ant-design/plots 颜色生成逻辑：1-2 小时
- 实现颜色生成函数：1-2 小时
- 更新 FilterPanel 组件：1 小时
- 测试验证：1 小时
- 更新文档：0.5 小时

总计：4.5-6.5 小时
