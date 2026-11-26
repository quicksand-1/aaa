---
name: 'test-case-generator'
description: 'Generates test case code for components. Invoke when user wants to create test cases for components, including code examples in docs/components and documentation in docs/components.'
---

# Test Case Generator

为 fintech 库组件生成测试用例文档，代码示例内联在 `docs/components/<ComponentName>.md` 中。

## 文档规范

### Frontmatter（必需）

```yaml
---
group: 通用
title: ComponentName
order: 10
---
```

**字段说明：**

- `group`: 组件分组（通用/数据展示/表单/反馈/导航等）
- `title`: 组件名称，与文件名一致
- `order`: 排序顺序

### 文档结构（必需）

1. **组件说明**：`# ComponentName` 标题后简述功能，封装组件用 `> 封装 [ComponentName](链接)` 格式
2. **代码演示**：`## 代码演示` 章节，使用 ` ```jsx ` 代码块，含 `title` 注释
3. **API 文档**：`## API` 章节，表格格式（参数、说明、类型、默认值）

## 生成步骤

1. 从 `src` 目录识别组件名称
2. 创建 `docs/components/<ComponentName>.md`，包含：
   - Frontmatter（group、title、order）
   - 组件说明
   - 代码演示（` ```jsx ` 代码块内联）
   - API 表格
3. 创建 `.trae/skills/<ComponentName>` 目录（如不存在）
4. 生成 `SKILL.md` 配置文件
5. 验证符合规范

## 模板示例

````markdown
---
group: 通用
title: MyComponent
order: 10
---

# MyComponent

MyComponent 的功能说明

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { MyComponent } from 'fintech';

export default () => {
  return <MyComponent />;
};
```
````

## API

| 参数    | 说明 | 类型   | 默认值 |
| ------- | ---- | ------ | ------ |
| `prop1` | 说明 | `type` | -      |

````

## 调用时机

- 为组件创建测试用例
- 生成文档代码示例
- 创建组件文档结构
- 向文档添加新组件

## 最佳实践

- 组件名称与 `src` 目录完全匹配
- 代码示例简洁，专注核心功能
- 代码内联在文档中，不创建单独 demo 文件
- 遵循现有代码风格和文档模式

## 规范检查清单

- [ ] Frontmatter 包含 group、title、order
- [ ] 组件说明在标题后
- [ ] 代码演示使用 ` ```jsx ` 代码块，含 title 注释
- [ ] API 使用表格格式（参数、说明、类型、默认值）
````
