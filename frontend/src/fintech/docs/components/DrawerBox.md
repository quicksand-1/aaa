---
group: 通用
title: DrawerBox
order: 8
---

# DrawerBox

封装 [Drawer](https://ant-design.antgroup.com/components/drawer-cn)，支持原 API

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { DrawerBox } from 'fintech';

export default () => {
  const drawerRef = useRef();

  return (
    <>
      <Button onClick={() => drawerRef.current.open(true)} type="primary">
        Open
      </Button>
      <DrawerBox actionRef={drawerRef} title="Basic Drawer">
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p
          style={{
            color: 'red',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            background: '#fff',
          }}
        >
          这段文案有吸顶的效果
        </p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </DrawerBox>
    </>
  );
};
```

```jsx
/**
 * title: 无操作按钮
 */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { DrawerBox } from 'fintech';

export default () => {
  const drawerRef = useRef();

  return (
    <>
      <Button onClick={() => drawerRef.current.open(true)} type="primary">
        Open
      </Button>
      <DrawerBox actionRef={drawerRef} title="Basic Drawer" footer={null}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </DrawerBox>
    </>
  );
};
```

```jsx
/**
 * title: 无 header
 */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { DrawerBox } from 'fintech';

export default () => {
  const drawerRef = useRef();

  return (
    <>
      <Button onClick={() => drawerRef.current.open(true)} type="primary">
        Open
      </Button>
      <DrawerBox actionRef={drawerRef} closeIcon={null}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </DrawerBox>
    </>
  );
};
```

```jsx
/**
 * title: 自定义按钮
 */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { DrawerBox } from 'fintech';

export default () => {
  const drawerRef = useRef();

  return (
    <>
      <Button onClick={() => drawerRef.current.open(true)} type="primary">
        Open
      </Button>
      <DrawerBox
        actionRef={drawerRef}
        footer={['ok', <Button key="extra">自定义按钮</Button>, 'cancel']}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </DrawerBox>
    </>
  );
};
```

```jsx
/**
 * title: 按钮 loading
 */
import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { DrawerBox } from 'fintech';

export default () => {
  const drawerRef = useRef();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          drawerRef.current.open(true);
          setLoading(true);
        }}
      >
        Open
      </Button>
      <DrawerBox
        actionRef={drawerRef}
        confirmLoading={loading}
        footer={[
          <Button
            key="stop"
            onClick={() => {
              setLoading(false);
            }}
          >
            停止 loading
          </Button>,
          'ok',
        ]}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </DrawerBox>
    </>
  );
};
```

```jsx
/**
 * title: 表单用法
 */
import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { DrawerBox, FormSchema } from 'fintech';

export default () => {
  const drawerRef = useRef();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => drawerRef.current.open(true)}>
        Open
      </Button>
      <DrawerBox
        form
        size="60%"
        actionRef={drawerRef}
        okText="提交审批"
        cancelText="撤销"
        confirm="确定提交该审批内容？"
        confirmLoading={loading}
        onOk={({ values, open }) => {
          setLoading(true);
          setTimeout(() => {
            console.log(values);
            setLoading(false);
            open(false);
            // or
            // drawerRef.current.open(false);
          }, 2000);
        }}
        afterOpen={({ form }) => {
          form.setFieldsValue({
            id: 1,
            eventCode: 'EV001',
            eventName: '测试事件001',
            remark: '我是备注\n我是备注',
          });
          // or
          // drawerRef.current?.form.setFieldsValue({
          //   id: 1,
          //   eventCode: 'EV001',
          //   eventName: '测试事件001',
          //   remark: '我是备注\n我是备注',
          // })
        }}
      >
        <FormSchema
          gutter={8}
          colSpan={12}
          unique="id"
          items={[
            { name: 'eventCode', label: '事件编码' },
            { name: 'eventName', label: '事件名称' },
            {
              colSpan: 24,
              name: 'remark',
              label: '备注',
              valueType: 'textarea',
              inputProps: { rows: 3 },
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
```

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
      <DrawerBox size="60%" footer={false} title="详情" actionRef={drawerRef}>
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

## API

| 参数              | 说明                                                                          | 类型                                                                            | 默认值             |
| :---------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :----------------- |
| actionRef         | 自定义触发组件内部的方法，推荐使用，请不要使用 ref                            |                                                                                 |                    |
| form              | 表单设置                                                                      | boolean \| [FormProps](https://ant-design.antgroup.com/components/form-cn#form) |                    |
| formReset         | 浮层关闭后，是否重置表单，默认在关闭后重置                                    | boolean                                                                         | true               |
| confirm           | onOk 触发的二次确定框内容                                                     | string                                                                          |                    |
| okText            | 确定按钮的文案                                                                | string                                                                          | 确定               |
| cancelText        | 取消按钮的文案                                                                | string                                                                          | 取消               |
| onOk              | 确定按钮的回调函数，使用 form 时，会调用 validateFields 并且返回表单的 values | function({ values, open, form })                                                |                    |
| onCancel          | 取消按钮的回调函数                                                            | function({ type, open, form })                                                  |                    |
| afterOpen         | 浮层打开后的回调函数                                                          | function({ open, form })                                                        |                    |
| afterClose        | 浮层关闭后的回调函数                                                          | function({ open, form })                                                        |                    |
| confirmLoading    | 确定按钮 和 内容区域的 loading 效果                                           | boolean                                                                         | false              |
| okButtonProps     | 确定按钮的属性                                                                | [Button](https://ant-design.antgroup.com/components/button-cn#api)              |                    |
| cancelButtonProps | 取消按钮的属性                                                                | [Button](https://ant-design.antgroup.com/components/button-cn#api)              |                    |
| footer            | 页脚属性                                                                      | array                                                                           | `['cancel', 'ok']` |

### CancelType<'close' | 'cancel'>

> 关闭浮层时的类型，close 是左上角 x 或遮罩层，cancel = 取消按钮

## 使用规范

### 1. actionRef 的使用

**推荐使用 actionRef，不要使用 ref**

```jsx | pure
// 外部组件
const drawerRef = useRef(null);

<DrawerBox actionRef={drawerRef} />;
```

**外部访问表单实例**

```jsx | pure
// 外部通过 actionRef 访问表单实例
actionRef.current?.form.setFieldsValue({ name: '测试' });
actionRef.current?.form.getFieldValue('name');
```

**外部触发刷新**

```jsx | pure
// 外部通过 actionRef 触发列表刷新
onOk={({ values, open }) => {
  request('/api/save.json', { method: 'POST', data: values }).then(() => {
    open(false);
    actionRef.current?.reload();
  });
}}
```

### 2. afterOpen 的使用

**处理浮层打开后的异步数据请求**

```jsx | pure
<DrawerBox
  afterOpen={() => {
    // 请求部门数据
    request('/system/org/tree/select.json').then((res) => {
      setDeptData(res);
    });
  }}
>
  <FormSchema
    items={[
      {
        name: 'pertainCode',
        label: '部门',
        children: <TreeSelect treeData={deptData} />,
      },
    ]}
  />
</DrawerBox>
```

**表单数据回显**

```jsx | pure
<DrawerBox
  afterOpen={() => {
    if (data) {
      drawerRef.current?.form.setFieldsValue({
        ...data,
        roleCodes: JSON.parse(data.roleCodes),
      });
    }
  }}
>
  <FormSchema items={formItems} />
</DrawerBox>
```

### 3. confirmLoading 的使用

**配合 request 的 setLoading 使用**

```jsx | pure
const [loading, setLoading] = useState(false);

<DrawerBox
  form
  confirmLoading={loading}
  onOk={({ values, open }) => {
    request('/api/save.json', {
      setLoading,
      method: 'POST',
      data: values,
    }).then(() => {
      open(false);
      actionRef.current?.reload();
      message.success('保存成功');
    });
  }}
>
  <FormSchema items={formItems} />
</DrawerBox>;
```

### 4. cloneElement 的使用

**包装子组件添加 onClick 事件**

```jsx | pure
const wrappedChild = cloneElement(children, {
  ...rest,
  onClick: () => {
    drawerRef.current?.open(true);
  },
});

return (
  <>
    {wrappedChild}
    <DrawerBox actionRef={drawerRef}>{/* 内容 */}</DrawerBox>
  </>
);
```

### 5. 注意事项

1. **actionRef 必须设置**：使用 `useRef` 创建引用并传递给 `actionRef`，用于控制抽屉的打开和关闭
2. **外部访问表单**：使用 `actionRef.current?.form` 访问表单实例，而不是直接访问 drawerRef
3. **afterOpen 回调**：用于处理浮层打开后的异步数据请求和表单回显
4. **confirmLoading 使用**：配合 request 的 setLoading 使用，自动管理加载状态
5. **form 模式**：设置 `form` 属性后，抽屉会自动包含表单验证和提交功能
6. **cloneElement 使用**：包装子组件添加 onClick 事件，实现点击打开抽屉的功能
