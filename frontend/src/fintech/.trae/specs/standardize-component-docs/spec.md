# 组件文档规范化流程 Spec

## Why

当前 test-case-generator 技能生成的文档格式不统一，缺少必要的元数据和结构规范。需要制定标准化的文档制作流程，确保所有组件文档遵循统一的格式和规范。

## What Changes

- 更新 test-case-generator 技能文档，明确文档生成规范
- 定义文档必须包含的元数据字段（group、title、order）
- 定义文档必须包含的结构（组件说明、代码演示、API）
- 提供标准化的文档模板和示例

## Impact

- Affected specs: test-case-generator 技能
- Affected code: `.trae/skills/test-case-generator/SKILL.md`

## ADDED Requirements

### Requirement: 文档元数据规范

系统 SHALL 确保所有组件文档包含完整的 frontmatter 元数据

#### Scenario: 文档 frontmatter 必须包含必需字段

- **WHEN** 生成组件文档
- **THEN** 文档开头的 --- 块中必须包含 group、title、order 三个字段
- **AND** group 表示组件分组（如：通用、数据展示、表单等）
- **AND** title 表示组件名称
- **AND** order 表示组件在文档中的排序顺序

### Requirement: 文档结构规范

系统 SHALL 确保所有组件文档包含必需的结构部分

#### Scenario: 文档必须包含组件说明

- **WHEN** 生成组件文档
- **THEN** 文档必须在 # 标题后包含组件说明
- **AND** 说明应简明扼要地描述组件的功能和用途
- **AND** 如果组件是对 Ant Design 组件的封装，应注明封装的原始组件

#### Scenario: 文档必须包含代码演示

- **WHEN** 生成组件文档
- **THEN** 文档必须包含 ## 代码演示 章节
- **AND** 代码演示使用 ```jsx 代码块格式
- **AND** 每个代码块应包含 title 注释（可选 description）
- **AND** 代码示例应展示组件的核心用法

#### Scenario: 文档必须包含 API 文档

- **WHEN** 生成组件文档
- **THEN** 文档必须包含 ## API 章节
- **AND** API 文档使用表格格式
- **AND** 表格应包含参数、说明、类型、默认值等列
- **AND** 列出组件的所有公开属性和方法

### Requirement: 技能文档更新

系统 SHALL 更新 test-case-generator 技能文档以反映新的规范

#### Scenario: 更新技能文档

- **WHEN** 制定文档规范化流程
- **THEN** 更新 `.trae/skills/test-case-generator/SKILL.md` 文件
- **AND** 在文档中明确说明文档生成规范
- **AND** 提供符合规范的文档模板示例
- **AND** 更新生成步骤以包含规范检查

## MODIFIED Requirements

无

## REMOVED Requirements

无
