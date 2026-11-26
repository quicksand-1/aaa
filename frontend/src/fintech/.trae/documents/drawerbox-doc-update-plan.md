# DrawerBox 文档更新计划

## 任务概述
将 `.trae/examples/DrawerBox_examples.md` 中的实际用例更新至 `docs/components/DrawerBox.md` 文档中。

## 更新原则
1. 保持现有文档排版结构
2. 确保更新的用例通俗易懂且可运行
3. 更新用例前熟读相关源代码，有根据
4. 更新的用例不重复、不啰嗦

## 当前文档结构分析
- 代码演示部分：6 个示例
  1. 基础用法
  2. 无操作按钮
  3. 无 header
  4. 自定义按钮
  5. 按钮 loading
  6. 表单用法
- API 文档

## 源码分析结果
通过阅读 `/src/DrawerBox/index.tsx` 源码，确认：
- **actionRef** 是推荐的引用方式，ref 已废弃
- **form 属性**：可以是 boolean 或 FormProps 对象
- **formReset**：浮层关闭后是否重置表单，默认 true
- **confirm**：onOk 触发的二次确定框内容
- **onOk 回调参数**：{ values, open, form }
- **onCancel 回调参数**：{ type, open, form }
- **afterOpen 回调参数**：{ open, form }
- **afterClose 回调参数**：{ open, form }
- **footer**：数组类型，支持自定义按钮
- **confirmLoading**：确定按钮和内容区域的 loading 效果
- 支持所有 Drawer 的原生属性

## 示例文件内容分析
包含 10 个分类：
1. 基础使用
2. 表单编辑抽屉
3. 详情查看抽屉
4. 图表展示抽屉
5. 表格编辑抽屉
6. 顶部固定抽屉
7. 带数据回显
8. 带确认加载
9. 自定义 Footer
10. 禁用关闭按钮

## 更新步骤

### 步骤 1：分析现有示例，确定保留内容
- 保留现有的 6 个示例，它们已经很好地展示了核心功能
- 保留 API 文档

### 步骤 2：从示例文件中筛选有价值的用例
根据源码分析和实际使用场景，筛选以下用例：

#### 2.1 表单编辑抽屉
- **保留理由**：当前文档已有表单用法示例，但可以补充更完整的表单编辑场景
- **示例来源**：DrawerBox_examples.md 第 2 节"表单编辑抽屉"
- **需要调整**：
  - 简化示例，移除外部依赖（message、request）
  - 展示基本的表单编辑和提交流程
  - 确保示例可独立运行

#### 2.2 详情查看抽屉
- **保留理由**：详情查看是常用的场景，当前文档缺少此类示例
- **示例来源**：DrawerBox_examples.md 第 3 节"详情查看抽屉"
- **需要调整**：
  - 简化示例，移除外部依赖（DescList 组件）
  - 使用简单的数据展示
  - 展示 footer={false} 的用法

#### 2.3 带 Loading 状态
- **保留理由**：当前文档已有按钮 loading 示例，但可以补充 confirmLoading 的用法
- **示例来源**：DrawerBox_examples.md 第 8 节"带确认加载"
- **需要调整**：
  - 简化示例，展示 confirmLoading 的基本用法
  - 结合表单提交场景

#### 2.4 带数据回显
- **保留理由**：afterOpen 回调是重要功能，需要展示如何使用
- **示例来源**：DrawerBox_examples.md 第 7 节"带数据回显"
- **需要调整**：
  - 简化示例，移除外部依赖（request）
  - 展示 afterOpen 回调的基本用法
  - 使用模拟数据回显

#### 2.5 禁用关闭按钮
- **保留理由**：closeIcon={null} 是有用的功能，当前文档已有"无 header"示例，但可以更明确地展示
- **示例来源**：DrawerBox_examples.md 第 10 节"禁用关闭按钮"
- **需要调整**：
  - 当前文档已有"无 header"示例（closeIcon={null}）
  - 不需要重复添加

### 步骤 3：设计新示例

#### 3.1 表单编辑抽屉
```jsx
/**
 * title: 表单编辑
 * description: 配合 FormSchema 实现表单编辑功能
 */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { DrawerBox, FormSchema } from 'fintech';

export default () => {
  const drawerRef = useRef();

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ];

  return (
    <>
      <Button type="primary" onClick={() => drawerRef.current.open(true)}>
        新增
      </Button>
      <DrawerBox
        form
        size="50%"
        actionRef={drawerRef}
        title="新增"
        onOk={({ values, open }) => {
          console.log('表单值:', values);
          setTimeout(() => {
            open(false);
          }, 1000);
        }}
      >
        <FormSchema items={formItems} />
      </DrawerBox>
    </>
  );
};
```

#### 3.2 详情查看抽屉
```jsx
/**
 * title: 详情查看
 * description: 使用 footer={false} 隐藏底部按钮
 */
import React, { useRef } from 'react';
import { Button, Descriptions } from 'antd';
import { DrawerBox } from 'fintech';

export default () => {
  const drawerRef = useRef();

  return (
    <>
      <Button type="primary" onClick={() => drawerRef.current.open(true)}>
        查看详情
      </Button>
      <DrawerBox
        size="60%"
        footer={false}
        title="详情"
        actionRef={drawerRef}
      >
        <Descriptions
          column={1}
          items={[
            { label: '名称', children: '测试项目' },
            { label: '编码', children: 'TEST001' },
            { label: '描述', children: '这是一个测试项目' },
          ]}
        />
      </DrawerBox>
    </>
  );
};
```

#### 3.3 带 Loading 状态
```jsx
/**
 * title: 提交加载
 * description: 使用 confirmLoading 控制提交按钮的加载状态
 */
import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { DrawerBox, FormSchema } from 'fintech';

export default () => {
  const drawerRef = useRef();
  const [loading, setLoading] = useState(false);

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
  ];

  return (
    <>
      <Button type="primary" onClick={() => drawerRef.current.open(true)}>
        新增
      </Button>
      <DrawerBox
        form
        size="50%"
        actionRef={drawerRef}
        title="新增"
        confirmLoading={loading}
        onOk={({ values, open }) => {
          setLoading(true);
          console.log('表单值:', values);
          setTimeout(() => {
            setLoading(false);
            open(false);
          }, 2000);
        }}
      >
        <FormSchema items={formItems} />
      </DrawerBox>
    </>
  );
};
```

#### 3.4 带数据回显
```jsx
/**
 * title: 数据回显
 * description: 使用 afterOpen 回调设置表单初始值
 */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { DrawerBox, FormSchema } from 'fintech';

export default () => {
  const drawerRef = useRef();

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ];

  return (
    <>
      <Button type="primary" onClick={() => drawerRef.current.open(true)}>
        编辑
      </Button>
      <DrawerBox
        form
        size="50%"
        actionRef={drawerRef}
        title="编辑"
        onOk={({ values, open }) => {
          console.log('表单值:', values);
          open(false);
        }}
        afterOpen={({ form }) => {
          form.setFieldsValue({
            name: '测试项目',
            code: 'TEST001',
            desc: '这是一个测试项目',
          });
        }}
      >
        <FormSchema items={formItems} />
      </DrawerBox>
    </>
  );
};
```

### 步骤 4：执行更新
1. 保留现有的 6 个示例
2. 在现有示例之后添加新的 4 个示例
3. 保持文档的一致性和可读性

## 更新后的文档结构
```
# DrawerBox

封装 Drawer，支持原 API

## 代码演示
1. 基础用法（保留）
2. 无操作按钮（保留）
3. 无 header（保留）
4. 自定义按钮（保留）
5. 按钮 loading（保留）
6. 表单用法（保留）
7. 表单编辑（新增）
8. 详情查看（新增）
9. 提交加载（新增）
10. 数据回显（新增）

## API
（保持不变）
```

## 注意事项
1. 所有新示例必须可独立运行，不依赖外部函数或变量
2. 保持代码简洁，避免冗余
3. 确保示例代码符合项目代码规范
4. 保持文档的一致性和可读性
5. 不重复现有示例中已展示的功能
6. 使用 antd 基础组件替代项目特定组件
