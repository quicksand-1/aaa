---
group: 工具
toc: content
order: 18
---

# storageSQL

localStorage 的操作方法

## select

> 查询某个表的数据，返回一个列表

```jsx | pure
storageSQL('select', {
  from: '表名', // 非必填，默认 default 表
  where: `id=1`, // 非必填，默认查询所有
  orderBy: 'createTime', // 非必填，指定排序字段，需要搭配 sort 字段使用
  sort: 'ASC | DESC', // 排序规则，默认 ASC（升序），DESC（降序）
  sequence: 'id', // 非必填，序列化：[{ id: 1 }, { id: 2 }] => [1, 2]
  inside: {
    // 非必填，查询结果中包含指定字段的值
    key: 'id', // 指定字段为 id
    value: [1, 2], // 值为 [1, 2]
  },
});
```

## find

> 查询某张表中匹配条件的数据

```jsx | pure
storageSQL('find', {
  from: '表名', // 非必填，默认 default 表
  where: `id=1`, // 非必填，默认查询所有
  defaultObject: {}, // 非必填，当查询结果为空时，返回默认对象
});
```

## insert

> 向表中插入一组新数据

```jsx | pure
storageSQL('insert', {
  from: '表名', // 非必填，默认 default 表
  values: [] | {}, // 必填，需要插入的数据
});
```

## update

> 更新表中某一行数据

```jsx | pure
storageSQL('update', {
  from: '表名', // 非必填，默认 default 表
  where: `id=1`, // 必填
  values: {}, // 必填，需要更新的数据
});
```

## duplicate

> 如果匹配则更新，否则插入

```jsx | pure
storageSQL('duplicate', {
  from: '表名', // 非必填，默认 default 表
  where: `id=1`, // 必填
  values: {} | [], // 必填，需要更新/插入的数据
});
```

## delete

> 删除某一行数据

```jsx | pure
storageSQL('delete', {
  from: '表名', // 非必填，默认 default 表
  where: `id=1`, // 必填
});
```

## drop

> 表删除操作

```jsx | pure
storageSQL('drop', {
  from: '表名', // 支持 all | String | String[]
});
```

## rename

> 重命名

```jsx | pure
storageSQL('rename', {
  oldName: '原表名',
  newName: `新表名`,
});
```

## where 语法支持如下

```
=：精准等于
×：不等于
≈：模糊匹配
>：大于
<：小于
≥：大于等于
≤：小于等于

// 多条件
where: `id=1;orderNo=2`
```
