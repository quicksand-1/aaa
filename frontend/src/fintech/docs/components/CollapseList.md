---
group: 通用
title: CollapseList
order: 5
---

# CollapseList

封装 [Collapse](https://ant-design.antgroup.com/components/collapse-cn)，支持内容切换

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useState, useEffect } from 'react';
import { CollapseList, LinkBtn } from 'fintech';

export default () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <CollapseList
      defaultActiveKey={['amount', 'rate']}
      items={[
        {
          loading,
          key: 'amount',
          label: '逾期未尝本金余额分布',
          children: ['左边的内容', '右边的内容'],
        },
        {
          loading: loading,
          key: 'rate',
          label: '迁徙率分布',
          children: ['左边的内容', '右边的内容'],
          extra: (
            <LinkBtn
              onClick={(e) => {
                // 需要手动阻止冒泡等事件，不然会触发折叠动效
                e.stopPropagation(); // 冒泡
                e.preventDefault(); // 捕获
              }}
            >
              额外的操作
            </LinkBtn>
          ),
        },
      ]}
    />
  );
};
```

## ItemType

支持原生 API

| 参数     | 说明                                                                       | 类型                                    | 默认值 |
| :------- | :------------------------------------------------------------------------- | :-------------------------------------- | :----- |
| key      | 对应 activeKey                                                             | string                                  |        |
| loading  | 加载状态                                                                   | boolean                                 |        |
| extra    | 右上角额外的操作空间                                                       | ReactNode                               |        |
| label    | 面板头内容                                                                 | ReactNode                               |        |
| open     | 是否展示                                                                   | boolean                                 | true   |
| children | 折叠内容<br />如果是普通的 ReactNode，则不会有切换按钮，此时和原生功能相似 | `ReactNode` \| `[ReactNode, ReactNode]` |        |
