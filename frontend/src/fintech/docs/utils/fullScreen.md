---
group: 工具
toc: content
order: 6
---

# fullScreen

浏览器全屏事件

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useRef } from 'react';
import { Space, Button } from 'antd';
import { fullScreen, DescList } from 'fintech';

export default () => {
  const ref = useRef();

  return (
    <div ref={ref} style={{ backgroundColor: '#fff', padding: 12 }}>
      <DescList
        bordered
        column={2}
        extra={
          <Space>
            <Button
              onClick={() => {
                fullScreen.open(ref.current);
              }}
            >
              打开全屏
            </Button>
            <Button
              onClick={() => {
                fullScreen.exit();
              }}
            >
              关闭全屏
            </Button>
          </Space>
        }
        dataSource={{
          name: '张三',
          age: 24,
          gender: 'male',
          motto: '以为忙碌的时候不会想你，却是更加的想你。',
          revenue: {
            amount: 20000000,
          },
          lifeProgress: 50,
          lifeProgress2: 0.5,
        }}
        columns={[
          {
            title: '姓名',
            dataIndex: 'name',
          },
          {
            title: '年龄',
            dataIndex: 'age',
          },
          {
            title: '性别',
            dataIndex: 'gender',
            valueEnum: { female: '女性', male: '男性' },
          },
          {
            title: '年收入',
            dataIndex: ['revenue', 'amount'],
            valueType: 'money',
          },
          {
            title: '人生进度',
            dataIndex: 'lifeProgress',
            valueType: 'percent',
          },
          {
            title: '人生进度2',
            dataIndex: 'lifeProgress2',
            valueType: 'percent*100',
          },
          {
            span: 2,
            title: '座右铭',
            dataIndex: 'motto',
            copyable: true,
          },
          {
            span: 2,
            title: 'JSON',
            dataIndex: 'json',
            valueType: 'jsonCode',
          },
        ]}
      />
    </div>
  );
};
```
