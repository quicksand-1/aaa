---
group: 通用
title: EditTable
order: 9
---

# EditTable

封装 [EditableProTable](https://pro-components.antdigital.dev/components/editable-table)，并添加了一些额外的特性

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useEffect } from 'react';
import { EditTable, Form, SelectList } from 'fintech';

export default () => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      items: [{ subID: 1 }, { subID: 2 }, { subID: 3 }, { subID: 4 }],
    });
  }, []);

  return (
    <Form form={form}>
      <EditTable
        name="items"
        columns={[
          { title: '普通', dataIndex: 'default', width: 200 },
          {
            title: 'select',
            dataIndex: 'select',
            valueType: 'select',
            valueEnum: ['有限责任公司', '股份有限公司'],
          },
          {
            title: 'dict枚举',
            dataIndex: 'dict',
            valueType: 'dict',
            valueEnum: 'dateType',
          },
          {
            title: '自定义子组件',
            dataIndex: 'extraChildren',
            formItemRender: (item, _, form2) => (
              <SelectList
                options={{ CHINA: '中国', USA: '美国' }}
                onChange={() => {
                  form2.setFieldValue(['items', item.index, 'linkage'], null);
                }}
              />
            ),
          },
          {
            title: '联动',
            dataIndex: 'linkage',
            formItemRender: (item, _, form) => {
              const extraChildren = form.getFieldValue([
                'items',
                item.index,
                'extraChildren',
              ]);

              return (
                <SelectList
                  key={extraChildren}
                  options={
                    extraChildren === 'CHINA'
                      ? ['北京', '上海', '乌鲁木齐', '齐齐哈尔']
                      : ['西雅图', '纽约']
                  }
                />
              );
            },
          },
        ]}
      />
    </Form>
  );
};
```

```jsx
/**
 * title: 延迟渲染
 */
import React, { useEffect, useState } from 'react';
import { EditTable, Form, MagicTabs } from 'fintech';

export default () => {
  const [form] = Form.useForm();
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(['001', '002']);
    form.setFieldsValue({
      items: {
        '001': [
          { subID: 1, default: 1 },
          { subID: 2 },
          { subID: 3 },
          { subID: 4 },
        ],
        '002': [{ subID: 5 }, { subID: 6 }, { subID: 7 }, { subID: 8 }],
      },
    });
  }, []);

  return (
    <Form form={form}>
      <MagicTabs
        persistenceKey={false}
        items={[
          { key: 'a', label: '空白页' },
          {
            key: 'b',
            label: '编辑页',
            children: list.map((k) => (
              <EditTable
                key={k}
                name={['items', k]}
                columns={[
                  { title: '普通', dataIndex: 'default', width: 200 },
                  {
                    title: 'select',
                    dataIndex: 'select',
                    valueType: 'select',
                    valueEnum: ['有限责任公司', '股份有限公司'],
                  },
                  {
                    title: 'dict枚举',
                    dataIndex: 'dict',
                    valueType: 'dict',
                    valueEnum: 'dateType',
                  },
                ]}
              />
            )),
          },
        ]}
      />
    </Form>
  );
};
```

```jsx
/**
 * title: initId 方法使用
 */
import React, { useRef, useEffect } from 'react';
import { EditTable, Form, LinkBtn } from 'fintech';

export default () => {
  const [form] = Form.useForm();
  const editTableRef = useRef(null);

  useEffect(() => {
    // 模拟从接口获取数据，数据中可能缺少 subID 字段
    const dataFromApi = [
      { default: '数据1' },
      { default: '数据2' },
      { subID: 3, default: '数据3' }, // 已有 subID 的数据
      { default: '数据4' },
    ];

    // 使用 initId 方法为缺少 subID 的数据生成唯一 ID
    const processedData = editTableRef.current?.initId(dataFromApi) || [];

    form.setFieldsValue({
      items: processedData,
    });
  }, []);

  const handleInitId = () => {
    // 模拟手动触发 initId 方法
    const data = [{ default: '新数据1' }, { default: '新数据2' }];
    const processedData = editTableRef.current?.initId(data) || [];
    form.setFieldsValue({ items: processedData });
  };

  return (
    <Form form={form}>
      <LinkBtn onClick={handleInitId}>手动触发 initId 方法</LinkBtn>
      <br />
      <br />
      <EditTable
        actionRef={editTableRef}
        name="items"
        columns={[
          { title: '普通', dataIndex: 'default', width: 200 },
          {
            title: 'select',
            dataIndex: 'select',
            valueType: 'select',
            valueEnum: ['有限责任公司', '股份有限公司'],
          },
          {
            title: 'dict枚举',
            dataIndex: 'dict',
            valueType: 'dict',
            valueEnum: 'dateType',
          },
        ]}
      />
    </Form>
  );
};
```

## API

| 参数               | 说明                                              | 类型      | 默认值 |
| :----------------- | :------------------------------------------------ | :-------- | :----- |
| actionRef          | 组件引用，可通过 ref.initId 方法为数据生成唯一 ID | React.Ref | -      |
| hidden             | 是否显示组件，依然收集表单字段                    | boolean   | false  |
| action             | 是否需要操作列                                    | boolean   | true   |
| rowKey             | 数据唯一标识                                      | string    | subID  |
| createDefaultValue | 添加行数据时默认值                                | object    |        |

## PS

1. 默认 rowKey = subID，在初始化表格时，请确保每条数据中都有唯一的 rowKey 数据
2. 不要最下面的新增行 recordCreatorProps = false
3. 不要操作列 action = false
4. 默认所有字段都是必填的，如果不需要必填，设置 column.required = false
5. valueType 新增 dict 类型，valueEnum 是字典的 dictKey
6. 可通过 actionRef.current?.initId(list) 方法为数据生成唯一 ID，避免手动为每条数据添加 rowKey
