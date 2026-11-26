# 创建 FormSchema 组件文档 Spec

## Why
FormItem.md 文档中包含了 FormSchema 的用例，但 FormSchema 是一个独立的组件，应该有自己的独立文档。将 FormSchema 的用例从 FormItem.md 中分离出来，创建独立的 FormSchema.md 文档，可以提高文档的可维护性和可读性。

## What Changes
- 创建新的 FormSchema.md 文档文件
- 从 FormItem.md 中提取所有 FormSchema 相关的用例代码
- 在 FormSchema.md 中整理 FormSchema 的 API 文档
- 保留 FormItem.md 中的其他内容（FormItem 的基础用法等）

## Impact
- Affected specs: 无
- Affected code:
  - 新建文件: docs/components/FormSchema.md
  - 修改文件: docs/components/FormItem.md

## ADDED Requirements
### Requirement: 创建 FormSchema.md 文档
系统 SHALL 创建一个独立的 FormSchema.md 文档文件，包含 FormSchema 组件的完整文档。

#### Scenario: 成功创建文档
- **WHEN** 从 FormItem.md 中提取 FormSchema 相关内容
- **THEN** 创建完整的 FormSchema.md 文档，包含：
  - 文档元数据（group、title、order）
  - FormSchema 用法代码示例
  - FormSchema API 文档

### Requirement: 更新 FormItem.md 文档
系统 SHALL 从 FormItem.md 中移除 FormSchema 相关内容，保留 FormItem 的基础用法。

#### Scenario: 成功更新文档
- **WHEN** 提取 FormSchema 内容后
- **THEN** FormItem.md 中移除 FormSchema 用例代码，保留其他 FormItem 相关内容
