# DrawerBox 组件使用示例

## 目录
1. [基础使用](#1-基础使用)
2. [表单编辑抽屉](#2-表单编辑抽屉)
3. [详情查看抽屉](#3-详情查看抽屉)
4. [图表展示抽屉](#4-图表展示抽屉)
5. [表格编辑抽屉](#5-表格编辑抽屉)
6. [顶部固定抽屉](#6-顶部固定抽屉)
7. [带数据回显](#7-带数据回显)
8. [带确认加载](#8-带确认加载)
9. [自定义 Footer](#9-自定义-footer)
10. [禁用关闭按钮](#10-禁用关闭按钮)

---

## 1. 基础使用

### 示例 1: 最简单的 DrawerBox

```jsx
import React, { useRef } from 'react';
import { DrawerBox } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        打开抽屉
      </button>
      <DrawerBox
        actionRef={drawerRef}
        title="标题"
        size="50%"
      >
        <div>内容区域</div>
      </DrawerBox>
    </>
  );
};
```

### 示例 2: 带触发按钮的 DrawerBox

```jsx
import React, { useRef, cloneElement } from 'react';
import { DrawerBox } from 'fintech';

const Example = ({ children }) => {
  const drawerRef = useRef(null);

  const wrappedChild = children
    ? cloneElement(children, {
        onClick: () => {
          drawerRef.current?.open(true);
        },
      })
    : null;

  return (
    <>
      {wrappedChild}
      <DrawerBox
        actionRef={drawerRef}
        title="标题"
        size="50%"
      >
        <div>内容区域</div>
      </DrawerBox>
    </>
  );
};
```

**来源**: [metricHub/src/pages/job/systemJob/components/StopTimeModal.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/job/systemJob/components/StopTimeModal.jsx)

---

## 2. 表单编辑抽屉

### 示例 1: 基础表单编辑

```jsx
import React, { useRef } from 'react';
import { App } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';

const Example = () => {
  const { message } = App.useApp();
  const drawerRef = useRef(null);

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ];

  return (
    <DrawerBox
      form
      size="50%"
      actionRef={drawerRef}
      title="新增"
      onOk={async ({ values, open }) => {
        request('/api/save.json', {
          method: 'post',
          data: values,
        }).then(() => {
          open(false);
          message.success('保存成功');
        });
      }}
    >
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

### 示例 2: 带数据回显的表单编辑

```jsx
import React, { useRef } from 'react';
import { DrawerBox, FormSchema, request } from 'fintech';

const Example = ({ data }) => {
  const drawerRef = useRef(null);

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'desc', label: '描述', required: false },
  ];

  return (
    <DrawerBox
      form
      size="50%"
      actionRef={drawerRef}
      title={data ? '编辑' : '新增'}
      onOk={async ({ values, open }) => {
        request('/api/save.json', {
          method: 'post',
          data: values,
        }).then(() => {
          open(false);
        });
      }}
      afterOpen={({ form }) => {
        if (data?.id) {
          request(`/api/detail.json?id=${data.id}`).then((res) => {
            form.setFieldsValue(res);
          });
        }
      }}
    >
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

### 示例 3: 带禁用字段的表单编辑

```jsx
import React, { useRef } from 'react';
import { DrawerBox, FormSchema } from 'fintech';

const Example = ({ data }) => {
  const drawerRef = useRef(null);

  const formItems = [
    {
      name: 'code',
      label: '编码',
      disabled: !!data?.code,
      placeholder: '请注意，新增后无法修改',
    },
    { name: 'name', label: '名称' },
    { name: 'desc', label: '描述', required: false },
  ];

  return (
    <DrawerBox
      form
      size="50%"
      actionRef={drawerRef}
      title={data ? '编辑' : '新增'}
      onOk={async ({ values, open }) => {
        // 提交逻辑
      }}
    >
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

### 示例 4: 带复杂表单项的表单编辑

```jsx
import React, { useRef } from 'react';
import { DrawerBox, FormSchema } from 'fintech';
import { useModel } from '@umijs/max';

const Example = () => {
  const drawerRef = useRef(null);
  const { initialState, loading } = useModel('@@initialState');

  const formItems = [
    { name: 'code', label: '编码' },
    { name: 'name', label: '名称' },
    {
      name: 'type',
      label: '类型',
      valueType: 'select',
      inputProps: {
        mode: 'multiple',
        localSearch: true,
        fields: ['id', 'name'],
        options: initialState.options,
        loading,
      },
    },
    {
      name: 'status',
      label: '状态',
      valueType: 'select',
      required: false,
      inputProps: {
        mode: 'multiple',
      },
    },
  ];

  return (
    <DrawerBox
      form
      size="50%"
      actionRef={drawerRef}
      title="新增"
      onOk={async ({ values, open }) => {
        // 提交逻辑
      }}
    >
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

---

## 3. 详情查看抽屉

### 示例 1: 基础详情查看

```jsx
import React, { useRef } from 'react';
import { DrawerBox, DescList } from 'fintech';

const Example = ({ data }) => {
  const drawerRef = useRef(null);

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    { title: '描述', dataIndex: 'desc' },
  ];

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        查看详情
      </button>
      <DrawerBox
        size="60%"
        footer={false}
        title="详情"
        actionRef={drawerRef}
      >
        <DescList
          column={1}
          columns={columns}
          dataSource={data}
        />
      </DrawerBox>
    </>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetDetail.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetDetail.jsx)

### 示例 2: 远程数据加载的详情查看

```jsx
import React, { useRef } from 'react';
import { DrawerBox, DescList } from 'fintech';

const Example = ({ data }) => {
  const drawerRef = useRef(null);

  const columns = [
    { title: '编号', dataIndex: 'no' },
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'desc' },
    {
      span: 3,
      title: '列表',
      dataIndex: 'list',
      valueType: 'tags',
    },
  ];

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        查看详情
      </button>
      <DrawerBox
        size="60%"
        footer={false}
        title="详情"
        actionRef={drawerRef}
      >
        <DescList
          column={1}
          columns={columns}
          url="/api/detail.json"
          params={{ id: data.id }}
        />
      </DrawerBox>
    </>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetDetail.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetDetail.jsx)

---

## 4. 图表展示抽屉

### 示例 1: 基础图表展示

```jsx
import React, { useRef } from 'react';
import { DrawerBox, LinePro } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        查看图表
      </button>
      <DrawerBox
        size="95%"
        footer={null}
        actionRef={drawerRef}
        title="图形数据"
      >
        <LinePro
          data={dataSource}
          fields={['date', 'value', 'series']}
        />
      </DrawerBox>
    </>
  );
};
```

**来源**: [ifin/src/pages/operation/vintage/repay/chart.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/operation/vintage/repay/chart.jsx)

### 示例 2: 禁用关闭按钮的图表展示

```jsx
import React, { useRef } from 'react';
import { DrawerBox, LinePro } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        查看图表
      </button>
      <DrawerBox
        size="95%"
        footer={null}
        actionRef={drawerRef}
        closeIcon={null}
        title="图形数据"
      >
        <LinePro
          data={dataSource}
          fields={['date', 'value', 'series']}
        />
      </DrawerBox>
    </>
  );
};
```

**来源**: [ifin/src/pages/operation/vintage/repay/chart.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/operation/vintage/repay/chart.jsx)

### 示例 3: 多图表展示

```jsx
import React, { useRef } from 'react';
import { DrawerBox, LinePro, ColumnPro } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        查看图表
      </button>
      <DrawerBox
        size="95%"
        footer={null}
        actionRef={drawerRef}
        title="图形数据"
      >
        <LinePro
          data={dataSource1}
          fields={['date', 'value', 'series']}
        />
        <ColumnPro
          data={dataSource2}
          fields={['date', 'value']}
        />
      </DrawerBox>
    </>
  );
};
```

**来源**: [ifin/src/pages/operation/vintage/repay/chart.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/operation/vintage/repay/chart.jsx)

---

## 5. 表格编辑抽屉

### 示例 1: 基础表格编辑

```jsx
import React, { useRef, useState } from 'react';
import { DrawerBox, EditableProTable } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);
  const [editableKeys, setEditableKeys] = useState([]);

  const columns = [
    { title: '名称', dataIndex: 'name', editable: true },
    { title: '编码', dataIndex: 'code', editable: true },
    { title: '描述', dataIndex: 'desc', editable: true },
  ];

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        编辑表格
      </button>
      <DrawerBox
        size="75%"
        actionRef={drawerRef}
        title="编辑"
        onOk={async ({ open }) => {
          // 保存逻辑
          open(false);
        }}
      >
        <EditableProTable
          rowKey="id"
          columns={columns}
          value={dataSource}
          onChange={setDataSource}
          editable={{
            type: 'multiple',
            editableKeys,
            onChange: setEditableKeys,
          }}
        />
      </DrawerBox>
    </>
  );
};
```

**来源**: [metricHub/src/pages/baseData/baseMetric/dimensionInfo/SubDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/baseMetric/dimensionInfo/SubDrawer.jsx)

### 示例 2: 带新增行的表格编辑

```jsx
import React, { useRef, useState } from 'react';
import { DrawerBox, EditableProTable } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);
  const [editableKeys, setEditableKeys] = useState([]);

  const columns = [
    { title: '名称', dataIndex: 'name', editable: true },
    { title: '编码', dataIndex: 'code', editable: true },
  ];

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        编辑表格
      </button>
      <DrawerBox
        size="75%"
        actionRef={drawerRef}
        title="编辑"
        onOk={async ({ open }) => {
          // 保存逻辑
          open(false);
        }}
      >
        <EditableProTable
          rowKey="id"
          columns={columns}
          value={dataSource}
          onChange={setDataSource}
          editable={{
            type: 'multiple',
            editableKeys,
            onChange: setEditableKeys,
            actionRender: (row, config, defaultDoms) => {
              return [defaultDoms.delete];
            },
          }}
        />
      </DrawerBox>
    </>
  );
};
```

**来源**: [metricHub/src/pages/baseData/baseMetric/dimensionInfo/SubDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/baseMetric/dimensionInfo/SubDrawer.jsx)

---

## 6. 顶部固定抽屉

### 示例 1: 顶部固定抽屉

```jsx
import React, { useRef } from 'react';
import { DrawerBox } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);

  return (
    <>
      <button onClick={() => drawerRef.current?.open(true)}>
        打开顶部抽屉
      </button>
      <DrawerBox
        size={60}
        mask={false}
        footer={null}
        closeIcon={null}
        actionRef={drawerRef}
        placement="top"
        styles={{ body: { padding: 8 } }}
      >
        <div>顶部固定内容</div>
      </DrawerBox>
    </>
  );
};
```

**来源**: [accounting/src/pages/books/voucher/Manual.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/books/voucher/Manual.jsx)

---

## 7. 带数据回显

### 示例 1: 基础数据回显

```jsx
import React, { useRef } from 'react';
import { DrawerBox, FormSchema, request } from 'fintech';

const Example = ({ data }) => {
  const drawerRef = useRef(null);

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
  ];

  return (
    <DrawerBox
      form
      size="50%"
      actionRef={drawerRef}
      title="编辑"
      onOk={async ({ values, open }) => {
        // 提交逻辑
      }}
      afterOpen={({ form }) => {
        if (data?.id) {
          request(`/api/detail.json?id=${data.id}`).then((res) => {
            form.setFieldsValue(res);
          });
        }
      }}
    >
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

### 示例 2: 复杂数据回显

```jsx
import React, { useRef } from 'react';
import { DrawerBox, FormSchema, request } from 'fintech';

const Example = ({ data }) => {
  const drawerRef = useRef(null);

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    {
      name: 'list1',
      label: '列表1',
      valueType: 'select',
      inputProps: { mode: 'multiple' },
    },
    {
      name: 'list2',
      label: '列表2',
      valueType: 'select',
      inputProps: { mode: 'multiple' },
    },
  ];

  return (
    <DrawerBox
      form
      size="50%"
      actionRef={drawerRef}
      title="编辑"
      onOk={async ({ values, open }) => {
        // 提交逻辑
      }}
      afterOpen={({ form }) => {
        if (data?.id) {
          request(`/api/detail.json?id=${data.id}`).then((res) => {
            form.setFieldsValue({
              ...res,
              edit: true,
              list1: res.list1NoList,
              list2: res.list2NoList,
            });
          });
        }
      }}
    >
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

---

## 8. 带确认加载

### 示例 1: 基础确认加载

```jsx
import React, { useRef, useState } from 'react';
import { DrawerBox, FormSchema, request } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const formItems = [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
  ];

  return (
    <DrawerBox
      form
      size="50%"
      actionRef={drawerRef}
      title="新增"
      confirmLoading={loading}
      onOk={async ({ values, open }) => {
        setLoading(true);
        request('/api/save.json', {
          method: 'post',
          data: values,
        }).then(() => {
          open(false);
          setLoading(false);
        }).finally(() => {
          setLoading(false);
        });
      }}
    >
      <FormSchema items={formItems} />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetAddDrawer.jsx)

---

## 9. 自定义 Footer

### 示例 1: 隐藏 Footer

```jsx
import React, { useRef } from 'react';
import { DrawerBox, DescList } from 'fintech';

const Example = ({ data }) => {
  const drawerRef = useRef(null);

  return (
    <DrawerBox
      size="60%"
      footer={false}
      title="详情"
      actionRef={drawerRef}
    >
      <DescList
        column={1}
        columns={columns}
        dataSource={data}
      />
    </DrawerBox>
  );
};
```

**来源**: [metricHub/src/pages/baseData/metricSet/_components/MetricSetDetail.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/baseData/metricSet/_components/MetricSetDetail.jsx)

### 示例 2: Footer 为 null

```jsx
import React, { useRef } from 'react';
import { DrawerBox, LinePro } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);

  return (
    <DrawerBox
      size="95%"
      footer={null}
      actionRef={drawerRef}
      title="图形数据"
    >
      <LinePro
        data={dataSource}
        fields={['date', 'value', 'series']}
      />
    </DrawerBox>
  );
};
```

**来源**: [ifin/src/pages/operation/vintage/repay/chart.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/operation/vintage/repay/chart.jsx)

---

## 10. 禁用关闭按钮

### 示例 1: 禁用关闭按钮

```jsx
import React, { useRef } from 'react';
import { DrawerBox, LinePro } from 'fintech';

const Example = () => {
  const drawerRef = useRef(null);

  return (
    <DrawerBox
      size="95%"
      footer={null}
      actionRef={drawerRef}
      closeIcon={null}
      title="图形数据"
    >
      <LinePro
        data={dataSource}
        fields={['date', 'value', 'series']}
      />
    </DrawerBox>
  );
};
```

**来源**: [ifin/src/pages/operation/vintage/repay/chart.jsx](file:///Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/operation/vintage/repay/chart.jsx)

---

## 常见使用场景总结

### 场景 1: 表单编辑抽屉

```jsx
<DrawerBox
  form
  size="50%"
  actionRef={drawerRef}
  title="新增"
  onOk={async ({ values, open }) => {
    await request('/api/save.json', {
      method: 'post',
      data: values,
    });
    open(false);
    message.success('保存成功');
  }}
  afterOpen={({ form }) => {
    if (data?.id) {
      form.setFieldsValue(data);
    }
  }}
>
  <FormSchema items={formItems} />
</DrawerBox>
```

### 场景 2: 详情查看抽屉

```jsx
<DrawerBox
  size="60%"
  footer={false}
  title="详情"
  actionRef={drawerRef}
>
  <DescList
    column={1}
    columns={columns}
    dataSource={data}
  />
</DrawerBox>
```

### 场景 3: 图表展示抽屉

```jsx
<DrawerBox
  size="95%"
  footer={null}
  actionRef={drawerRef}
  closeIcon={null}
  title="图形数据"
>
  <LinePro
    data={dataSource}
    fields={['date', 'value', 'series']}
  />
</DrawerBox>
```

### 场景 4: 表格编辑抽屉

```jsx
<DrawerBox
  size="75%"
  actionRef={drawerRef}
  title="编辑"
  onOk={async ({ open }) => {
    await request('/api/save.json', {
      method: 'post',
      data: dataSource,
    });
    open(false);
  }}
>
  <EditableProTable
    rowKey="id"
    columns={columns}
    value={dataSource}
    onChange={setDataSource}
    editable={{
      type: 'multiple',
      editableKeys,
      onChange: setEditableKeys,
    }}
  />
</DrawerBox>
```

### 场景 5: 顶部固定抽屉

```jsx
<DrawerBox
  size={60}
  mask={false}
  footer={null}
  closeIcon={null}
  actionRef={drawerRef}
  placement="top"
  styles={{ body: { padding: 8 } }}
>
  <div>顶部固定内容</div>
</DrawerBox>
```

---

## 属性说明

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| actionRef | ref | 抽屉引用，用于控制打开/关闭 | `actionRef={drawerRef}` |
| title | string | 抽屉标题 | `title="标题"` |
| size | string/number | 抽屉宽度/高度 | `size="50%"` 或 `size={600}` |
| footer | boolean/null | 底部按钮配置 | `footer={false}` 或 `footer={null}` |
| form | boolean | 是否为表单模式 | `form` |
| confirmLoading | boolean | 确认按钮加载状态 | `confirmLoading={loading}` |
| closeIcon | ReactNode/null | 关闭图标 | `closeIcon={null}` |
| placement | string | 抽屉位置，可选 top/bottom/left/right | `placement="top"` |
| mask | boolean | 是否显示遮罩 | `mask={false}` |
| styles | object | 样式配置 | `styles={{ body: { padding: 8 } }}` |
| onOk | function | 确认按钮点击事件 | `onOk={({ values, open }) => {}}` |
| afterOpen | function | 打开后回调 | `afterOpen={({ form }) => {}}` |
| afterClose | function | 关闭后回调 | `afterClose={() => {}}` |

### actionRef 方法

| 方法 | 说明 | 示例 |
|------|------|------|
| open | 打开抽屉 | `drawerRef.current?.open(true)` |
| close | 关闭抽屉 | `drawerRef.current?.close()` |

### onOk 回调参数

| 参数 | 类型 | 说明 |
|------|------|------|
| values | object | 表单值（仅 form 模式） |
| open | function | 控制抽屉打开/关闭的方法 |
| form | FormInstance | 表单实例（仅 form 模式） |

### afterOpen 回调参数

| 参数 | 类型 | 说明 |
|------|------|------|
| form | FormInstance | 表单实例（仅 form 模式） |

---

## 注意事项

1. **actionRef 必须设置**：使用 `useRef` 创建引用并传递给 `actionRef`，用于控制抽屉的打开和关闭
2. **form 模式**：设置 `form` 属性后，抽屉会自动包含表单验证和提交功能
3. **footer 配置**：`footer={false}` 隐藏底部按钮，`footer={null}` 不显示底部区域
4. **closeIcon 使用**：`closeIcon={null}` 可以禁用关闭按钮，适用于需要强制操作的场景
5. **placement 使用**：`placement="top"` 或 `"bottom"` 时需要设置 `height` 属性
6. **mask 使用**：`mask={false}` 适用于顶部固定抽屉等场景
7. **onOk 回调**：`onOk` 接收 `{ values, open, form }` 参数，`open(false)` 用于关闭抽屉
8. **afterOpen 回调**：`afterOpen` 适用于数据回显场景，在抽屉打开后设置表单值
9. **confirmLoading**：提交时设置 `confirmLoading={true}`，防止重复提交
10. **width 和 height**：`width` 适用于左右抽屉，`height` 适用于上下抽屉
11. **styles 配置**：`styles.body` 可以设置内容区域的样式，如 padding
12. **表单验证**：form 模式下，只有验证通过才会触发 `onOk`
13. **数据回显**：使用 `afterOpen` 回调中的 `form.setFieldsValue` 方法设置表单值
14. **关闭抽屉**：使用 `open(false)` 或 `drawerRef.current?.close()` 关闭抽屉
15. **表格编辑**：配合 `EditableProTable` 使用时，需要在 `onOk` 中保存表格数据