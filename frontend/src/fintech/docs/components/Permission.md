---
group: 权限
title: Permission
order: 1
---

## 权限码相关

### useAccess

```jsx | pure
import { Permission } from 'fintech';

const isAccess = Permission.useAccess();

// 权限码只有一个，有返回 true，反之返回 false
console.log(isAccess('system'));

// 多个权限码
console.log(isAccess(['dict_disable', 'dict_enable', 'dict_del'])); // 必须有所有权限才返回 true
console.log(isAccess(['dict_disable', 'dict_enable', 'dict_del'], 'some')); // 有其中一个权限码返回 true

// 平台权限码
console.log(isAccess('system/gt|tj'));
console.log(isAccess(['system/gt', 'mgr/gt']));
```

### Access

> code 用法同 useAccess

```jsx | pure
import { Permission } from 'fintech';

<Permission.Access code="books">
  {children}
</Permission.Access>

<Permission.Access code={['books', 'books_add']} type="some">
  {children}
</Permission.Access>
```

## 平台相关

### isPlatform

```jsx | pure
import { Permission } from 'fintech';

const { isPlatform } = Permission;

console.log(isPlatform('gt'));
console.log(isPlatform('gt|tj'));
```

### Platform

```jsx | pure
import { Permission } from 'fintech';

const { Platform } = Permission;

<Platform code="tj">
  {children}
</Platform>

<Platform code="tj|gt">
  {children}
</Platform>
```

## 应用相关

### isApp

```jsx | pure
import { Permission } from 'fintech';

const { isApp } = Permission;

console.log(isApp('hb'));
console.log(isApp('hb|jb'));
```

### App

```jsx | pure
import { Permission } from 'fintech';

const { App } = Permission;

<App code="hb">
  {children}
</App>

<App code="hb|jb">
  {children}
</App>
```
