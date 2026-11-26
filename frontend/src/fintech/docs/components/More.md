---
group: 通用
title: More
order: 19
---

# More

将多个操作内容收拢起来

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { LinkBtn, More } from 'fintech';

export default () => {
  return (
    <More
      items={[
        {
          children: <LinkBtn key="1">编辑</LinkBtn>,
        },
        {
          children: (
            <LinkBtn
              key="2"
              color="red"
              title="删除"
              content="确定删除该信息？"
              onOk={() => {
                // todo
              }}
            >
              删除
            </LinkBtn>
          ),
        },
        {
          open: false,
          children: (
            <LinkBtn
              key="3"
              color="red"
              title="删除"
              content="确定删除该信息？"
              onOk={() => {
                // todo
              }}
            >
              删除2
            </LinkBtn>
          ),
        },
        {
          children: (
            <LinkBtn key="4" color="green">
              提交
            </LinkBtn>
          ),
        },
      ]}
    />
  );
};
```

## API

| 参数    | 说明     | 类型        | 默认值 |
| :------ | :------- | :---------- | :----- |
| maxShow | 展示个数 | number      | 2      |
| items   | 操作列表 | ItemProps[] |        |

### ItemProps

| 参数     | 说明     | 类型      | 默认值 |
| :------- | :------- | :-------- | :----- |
| open     | 是否展示 | boolean   | true   |
| children | 操作内容 | ReactNode |        |
