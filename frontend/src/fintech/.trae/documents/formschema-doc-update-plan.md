# FormSchema 文档更新计划

## 任务概述
将 `.trae/examples/FormSchema_examples.md` 中的实际用例更新至 `docs/components/FormSchema.md` 文档中。

## 更新原则
1. 保留现有 FormSchema.md 的排版结构
2. 确保更新的用例通俗易懂且可运行
3. 更新用例前熟读 FormSchema 相关源代码，有根据
4. 更新的用例不重复、不啰嗦

## 当前文档结构分析
- 代码演示部分：7 个示例
- API 文档
- 特性说明

## 示例文件内容分析
包含 10 个分类，每个分类有多个示例：
1. 基础使用
2. 布局配置
3. 动态表单项
4. 条件渲染
5. 表单验证
6. 自定义组件
7. 嵌套表单
8. 表格编辑
9. 文件上传
10. 复杂联动

## 更新步骤

### 步骤 1：分析现有示例，确定保留内容
- 保留现有的 7 个示例，它们已经很好地展示了核心功能
- 保留 API 文档和特性说明

### 步骤 2：从示例文件中筛选有价值的用例
根据源码分析和实际使用场景，筛选以下用例：

#### 2.1 表单验证用例
- **保留理由**：当前文档缺少验证规则示例，这是实际开发中非常常用的功能
- **示例来源**：FormSchema_examples.md 第 5 节"表单验证"
- **需要调整**：
  - 简化示例，只保留最常用的验证规则
  - 移除依赖外部枚举的代码
  - 确保示例可独立运行

#### 2.2 自定义组件用例
- **保留理由**：当前文档缺少 children 属性的使用示例
- **示例来源**：FormSchema_examples.md 第 6 节"自定义组件"
- **需要调整**：
  - 使用简单的自定义组件示例
  - 避免依赖项目特定的组件（如 EntitySelect、SelectList 等）
  - 使用 antd 基础组件演示

#### 2.3 条件渲染用例（open 属性）
- **保留理由**：当前文档的联动示例较复杂，需要补充简单的 open 属性示例
- **示例来源**：FormSchema_examples.md 第 4 节"条件渲染"
- **需要调整**：
  - 简化条件逻辑
  - 使用更直观的场景

#### 2.4 hidden 属性用例
- **保留理由**：hidden 属性在实际开发中很常用，但当前文档未提及
- **示例来源**：FormSchema_examples.md 第 1 节"基础使用"示例 3
- **需要调整**：
  - 简化示例
  - 说明 hidden 和 open 的区别

### 步骤 3：设计新示例

#### 3.1 表单验证示例
```jsx
/**
 * title: 表单验证
 * description: 使用 rules 属性添加验证规则
 */
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={12}
        items={[
          {
            name: 'name',
            label: '名称',
            rules: [{ required: true, message: '请输入名称' }],
          },
          {
            name: 'code',
            label: '编码',
            rules: [{ max: 64, message: '最多64个字符' }],
          },
          {
            name: 'email',
            label: '邮箱',
            required: false,
            rules: [{ type: 'email', message: '请输入正确格式的邮箱' }],
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

#### 3.2 自定义组件示例
```jsx
/**
 * title: 自定义组件
 * description: 使用 children 属性自定义表单项内容
 */
import React from 'react';
import { Button, Select } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={12}
        items={[
          {
            name: 'name',
            label: '名称',
          },
          {
            name: 'category',
            label: '分类',
            children: (
              <Select
                style={{ width: '100%' }}
                options={[
                  { value: 'tech', label: '技术' },
                  { value: 'finance', label: '金融' },
                  { value: 'health', label: '健康' },
                ]}
              />
            ),
          },
          {
            name: 'priority',
            label: '优先级',
            children: (
              <Select
                style={{ width: '100%' }}
                options={[
                  { value: 'high', label: '高' },
                  { value: 'medium', label: '中' },
                  { value: 'low', label: '低' },
                ]}
              />
            ),
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

#### 3.3 条件渲染示例（open 属性）
```jsx
/**
 * title: 条件渲染
 * description: 使用 open 属性控制表单项显示
 */
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={12}
        items={[
          {
            name: 'name',
            label: '名称',
          },
          {
            name: 'hasContact',
            label: '是否有联系方式',
            valueType: 'select',
            valueEnum: { '1': '是', '0': '否' },
          },
          {
            name: 'phone',
            label: '电话',
            open: false,
          },
          {
            name: 'email',
            label: '邮箱',
            open: false,
          },
        ]}
      />
      <FormSchema
        items={[
          ({ hasContact }) =>
            hasContact === '1' && [
              {
                name: 'phone',
                label: '电话',
                open: true,
              },
              {
                name: 'email',
                label: '邮箱',
                open: true,
              },
            ],
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

#### 3.4 hidden 属性示例
```jsx
/**
 * title: 隐藏字段
 * description: 使用 hidden 属性隐藏表单项，隐藏的字段不会参与布局但会参与表单提交
 */
import React from 'react';
import { Button } from 'antd';
import { FormSchema, Form } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={(res) => {
        console.log('提交的数据:', res);
        alert(JSON.stringify(res));
      }}
    >
      <FormSchema
        gutter={12}
        colSpan={12}
        items={[
          {
            name: 'id',
            label: 'ID',
            hidden: true,
            required: false,
          },
          {
            name: 'name',
            label: '名称',
          },
          {
            name: 'code',
            label: '编码',
          },
        ]}
      />
      <Button type="primary" htmlType="submit">
        提交
      </Button>
    </Form>
  );
};
```

### 步骤 4：更新 API 文档
根据源码分析，补充以下属性说明：

#### items 支持的类型（已存在，需要补充）
- **对象**：支持 `dataIndex` 和 `title` 作为 `name` 和 `label` 的别名

#### 表单项配置属性（需要补充）
| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| dataIndex | string | 字段名（name 的别名） | `dataIndex="name"` |
| title | string | 标签（label 的别名） | `title="名称"` |
| open | boolean/function | 是否显示 | `open={true}` 或 `open={() => condition}` |
| hidden | boolean | 是否隐藏 | `hidden={true}` |
| format | string | 日期格式 | `format="YYYY-MM-DD"` |

### 步骤 5：更新特性说明
补充以下特性：
6. **字段别名**：支持 `dataIndex` 和 `title` 作为 `name` 和 `label` 的别名，与表格 columns 配置保持一致
7. **条件显示**：通过 `open` 属性控制表单项的显示，可以是布尔值或函数
8. **隐藏字段**：通过 `hidden` 属性隐藏字段，隐藏的字段不参与布局但会参与表单提交

### 步骤 6：执行更新
1. 在现有示例之后添加新示例（保持原有 7 个示例不变）
2. 更新 API 文档
3. 更新特性说明

## 更新后的文档结构
```
# FormSchema

## 代码演示
1. FormSchema 用法（基础用法）- 保留
2. 表单项联动 - 保留
3. FormSchema 表单禁用 - 保留
4. Checkbox 数据转化 - 保留
5. unique 使用 - 保留
6. 紧凑型表单组合 - 保留
7. 日期类型表单 - 保留
8. 表单验证 - 新增
9. 自定义组件 - 新增
10. 条件渲染 - 新增
11. 隐藏字段 - 新增

## API
- FormSchema
- ValueType
- items 支持的类型（更新）

## 特性
1. 统一配置 - 保留
2. 表单联动 - 保留
3. 唯一编号 - 保留
4. 紧凑组合 - 保留
5. 禁用控制 - 保留
6. 字段别名 - 新增
7. 条件显示 - 新增
8. 隐藏字段 - 新增
```

## 注意事项
1. 所有新示例必须可独立运行，不依赖项目特定的组件或枚举
2. 使用 antd 基础组件替代项目特定组件
3. 保持代码简洁，避免冗余
4. 确保示例代码符合项目代码规范
5. 保持文档的一致性和可读性
