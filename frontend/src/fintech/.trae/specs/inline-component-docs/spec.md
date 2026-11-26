# 组件文档代码内联化 Spec

## Why

当前组件文档使用 `<code src="./_components/...">` 方式引入测试用例代码，导致代码分散在多个文件中，维护不便。需要将代码直接内联到文档中，提高可读性和维护性。

## What Changes

- 将所有使用 `<code src="./_components/...">` 的文档改为使用 ```jsx 代码块直接嵌入代码
- 删除 docs/components/\_components 目录下的所有代码文件
- 保持文档结构和 API 说明不变

## Impact

- Affected specs: 无
- Affected code: docs/components/ 下的 18 个组件文档和 \_components 目录

## ADDED Requirements

### Requirement: 代码内联化

系统 SHALL 将所有组件文档中的外部代码引用改为内联代码块

#### Scenario: 文档代码内联

- **WHEN** 组件文档使用 `<code src="./_components/...">` 引入代码
- **THEN** 将代码内容直接嵌入到文档中，使用 ```jsx 代码块格式
- **AND** 保持原有的 title 和 description 属性作为代码块的注释

#### Scenario: 清理 \_components 目录

- **WHEN** 所有代码已内联到文档中
- **THEN** 删除 docs/components/\_components 目录及其所有子目录和文件

## MODIFIED Requirements

无

## REMOVED Requirements

无
