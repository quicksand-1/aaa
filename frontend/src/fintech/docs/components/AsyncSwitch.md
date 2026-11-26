---
group: 通用
title: AsyncSwitch
order: 2
---

# AsyncSwitch

封装 [Switch](https://ant-design.antgroup.com/components/switch-cn) 使其具有异步请求能力

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { message } from 'antd';
import { AsyncSwitch } from 'fintech';

export default () => {
  return (
    <AsyncSwitch
      name="isEff"
      nameEnum={['STOP', 'START']}
      size="medium"
      checkedChildren="开"
      unCheckedChildren="关"
      defaultChecked={false}
      url="/switch/demo.json"
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
};
```

```jsx
/**
 * title: 异步 beforeChange
 */
import React from 'react';
import { message, Modal } from 'antd';
import { AsyncSwitch } from 'fintech';

export default () => {
  return (
    <AsyncSwitch
      name="isEff"
      nameEnum={['STOP', 'START']}
      size="medium"
      checkedChildren="开"
      unCheckedChildren="关"
      defaultChecked={false}
      url="/switch/demo.json"
      beforeChange={(checked) => {
        return new Promise((resolve) => {
          Modal.confirm({
            title: '确认操作',
            content: `确定要${checked ? '打开' : '关闭'}吗？`,
            onOk: async () => {
              message.info('已确认，开始执行操作...');
              try {
                const res = await fetch(`https://randomuser.me/api`).then(
                  (res) => res.json(),
                );
                resolve({
                  total: res.info.results,
                  list: res.results,
                });
              } catch (error) {
                resolve(false);
              }
            },
            onCancel: () => {
              message.warning('已取消操作');
              resolve(false);
            },
          });
        });
      }}
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
};
```

```jsx
/**
 * title: 同步 beforeChange
 */
import React from 'react';
import { message } from 'antd';
import { AsyncSwitch } from 'fintech';

export default () => {
  return (
    <AsyncSwitch
      name="isEff"
      nameEnum={['STOP', 'START']}
      size="medium"
      checkedChildren="开"
      unCheckedChildren="关"
      defaultChecked={false}
      url="/switch/demo.json"
      beforeChange={(checked) => {
        message.info('同步 beforeChange 执行中...');
        return {
          timestamp: Date.now(),
          source: 'sync',
          extraInfo: `同步方式切换为${checked ? '开启' : '关闭'}`,
        };
      }}
      onOk={(checked) => {
        message.success(`已${checked ? '打开' : '关闭'}`);
      }}
    />
  );
};
```

```jsx
/**
 * title: 表单填写场景
 */
import React, { useState, useRef } from 'react';
import { AsyncSwitch, DrawerBox, FormSchema } from 'fintech';

export default () => {
  const drawerRef = useRef();
  const [resolveFn, setResolveFn] = useState(null);

  return (
    <>
      <AsyncSwitch
        name="isEff"
        nameEnum={['STOP', 'START']}
        size="medium"
        checkedChildren="开"
        unCheckedChildren="关"
        defaultChecked={false}
        url="/switch/demo.json"
        beforeChange={async (checked) => {
          return new Promise((resolve) => {
            setResolveFn(() => resolve);
            drawerRef.current.open(true);
          });
        }}
        onOk={(checked, res) => {
          drawerRef.current.open(true);
          console.log(
            `已${checked ? '打开' : '关闭'}，响应数据：${JSON.stringify(res)}`,
          );
        }}
      />
      <DrawerBox
        form
        size="60%"
        actionRef={drawerRef}
        onOk={({ values, open }) => {
          console.log(values);
          if (resolveFn) {
            resolveFn({
              ...values,
              timestamp: Date.now(),
            });
          }
        }}
      >
        <FormSchema
          gutter={8}
          colSpan={12}
          items={[
            { name: 'eventCode', label: '事件编码' },
            { name: 'eventName', label: '事件名称' },
          ]}
        />
      </DrawerBox>
    </>
  );
};
```

## API

| 参数         | 说明                                                                    | 类型                                                                                             | 默认值          |
| :----------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :-------------- |
| url          | 请求地址，默认是 POST 请求                                              | requestUrl                                                                                       |                 |
| name         | 字段名，如不需要可设置成 null                                           | string \| null                                                                                   | status          |
| nameEnum     | 字段名枚举                                                              | `[false, true]`                                                                                  | `[false, true]` |
| params       | request 额外参数                                                        | object                                                                                           |                 |
| beforeChange | 切换前的回调函数，返回 false 可阻止切换；返回对象会合并到请求的 data 中 | function(checked): object \| Promise<object> \| false \| Promise<false> \| void \| Promise<void> |                 |
| onOk         | 异步请求成功后的回调函数                                                | function(checked, res)                                                                           |                 |
