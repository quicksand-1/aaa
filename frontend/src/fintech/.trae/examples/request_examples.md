# request 组件使用示例

## 目录
1. [基础使用](#1-基础使用)
2. [带 Loading 状态](#2-带-loading-状态)
3. [POST 请求](#3-post-请求)
4. [DELETE 请求](#4-delete-请求)
5. [带查询参数](#5-带查询参数)
6. [带复杂数据结构](#6-带复杂数据结构)
7. [文件下载（blob）](#7-文件下载blob)
8. [批量请求](#8-批量请求)

## 1. 基础使用

### 示例 1: 简单 GET 请求

```jsx
request(`/job/exec/${record.jobName}.json`).then((res) => {
  if (res.success) {
    hide();
    after('触发成功');
  }
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/job/systemJob/index.jsx:80-85

### 示例 2: 带参数的 GET 请求

```jsx
request(
  `/system/user/disable.json?userCode=${record.userCode}&status=${record.status}`
).then(() => {
  message.success('停用成功');
  ref.current?.reload();
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/system/userManage/index.jsx:65-70

## 2. 带 Loading 状态

### 示例 1: 基本 Loading 状态

```jsx
const [loading, setLoading] = useState(false);

request('/job/ctrJob.json', {
  setLoading,
  method: 'post',
  data: {
    ...params,
    orgCode,
    sameControl: false,
  },
}).then(() => {
  open?.(true);
  after(params.eff ? '启动成功' : '暂停成功');
  onCleanSelected?.();
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/job/systemJob/index.jsx:19-34

### 示例 2: 表单提交 Loading

```jsx
const [loading, setLoading] = useState(false);

request('/book/manual/save.json', {
  setLoading,
  method: 'POST',
  data: {
    entityNo,
    setDate: res.setDate,
    accountManualVoucherParams: [res],
  },
}).then(() => {
  form.resetFields();
  message.success('录入成功');
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/tools/manual/index.jsx:19-32

## 3. POST 请求

### 示例 1: 启动/暂停任务

```jsx
request('/job/ctrJob.json', {
  setLoading,
  method: 'post',
  data: {
    ...params,
    orgCode,
    sameControl: false,
  },
}).then(() => {
  open?.(true);
  after(params.eff ? '启动成功' : '暂停成功');
  onCleanSelected?.();
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/metricHub/src/pages/job/systemJob/index.jsx:21-34

### 示例 2: 保存表单数据

```jsx
request('/book/manual/save.json', {
  setLoading,
  method: 'POST',
  data: {
    entityNo,
    setDate: res.setDate,
    accountManualVoucherParams: [res],
  },
}).then(() => {
  form.resetFields();
  message.success('录入成功');
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/tools/manual/index.jsx:20-31

## 4. DELETE 请求

### 示例: 删除用户

```jsx
request(`/system/user/remove.json?userCode=${record.userCode}`, {
  method: 'DELETE',
}).then(() => {
  message.success('删除成功');
  ref.current?.reload();
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/system/userManage/index.jsx:119-124

## 5. 带查询参数

### 示例 1: 启用/停用用户

```jsx
request(
  `/system/user/enable.json?userCode=${record.userCode}&status=${record.status}`
).then(() => {
  message.success('启用成功');
  ref.current?.reload();
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/system/userManage/index.jsx:83-88

### 示例 2: 重置密码

```jsx
request(
  `/system/user/reset.json?userCode=${record.userCode}`
).then(() => {
  message.success('重置密码成功');
  ref.current?.reload();
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/ifin/src/pages/system/userManage/index.jsx:99-104

## 6. 带复杂数据结构

### 示例: 保存记账数据

```jsx
request('/book/manual/save.json', {
  setLoading,
  method: 'POST',
  data: {
    entityNo,
    setDate: res.setDate,
    accountManualVoucherParams: [res],
  },
}).then(() => {
  form.resetFields();
  message.success('录入成功');
});
```

**来源**: /Users/chenlong/Desktop/dev/opencode_副本/accounting/src/pages/tools/manual/index.jsx:20-31

## 7. 文件下载（blob）

### 示例: 文件流下载

```jsx
// 注：当 responseType=blob 时，表示是文件流下载
request('/api/download/file', {
  responseType: 'blob',
  method: 'GET',
}).then((blob) => {
  // 处理文件流
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'filename.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
});
```

**说明**: 此示例基于 request 工具的 blob 响应类型支持

## 8. 批量请求

### 示例: 并行发送多个请求

```jsx
import request from '@/utils/request';

request.all({
  reqs: [
    { url: '/api/data1.json', method: 'GET' },
    { url: '/api/data2.json', method: 'POST', data: { id: 1 } },
  ],
  setLoading,
}).then(([result1, result2]) => {
  // 处理多个请求的结果
  console.log(result1, result2);
});
```

**说明**: 此示例基于 request 工具的 all 方法

## 常见使用场景总结

### 场景 1: 表单提交

```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = (values) => {
  request('/api/submit.json', {
    setLoading,
    method: 'POST',
    data: values,
  }).then(() => {
    message.success('提交成功');
    form.resetFields();
  });
};
```

### 场景 2: 数据操作（增删改查）

```jsx
// 查询
request('/api/list.json').then((data) => setData(data));

// 新增
request('/api/add.json', {
  method: 'POST',
  data: newData,
}).then(() => message.success('新增成功'));

// 更新
request('/api/update.json', {
  method: 'POST',
  data: updatedData,
}).then(() => message.success('更新成功'));

// 删除
request('/api/delete.json', {
  method: 'DELETE',
  data: { id: record.id },
}).then(() => message.success('删除成功'));
```

### 场景 3: 批量操作

```jsx
request.all({
  reqs: selectedRows.map(row => ({
    url: '/api/action.json',
    method: 'POST',
    data: { id: row.id, action: 'process' },
  })),
  setLoading,
}).then(results => {
  message.success('批量操作完成');
  ref.current?.reload();
});
```

## 属性说明

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| url | string | 请求地址 | `/api/data.json` |
| method | string | 请求方法 | `'GET'`, `'POST'`, `'DELETE'` |
| data | object | 请求数据 | `{ id: 1, name: 'test' }` |
| setLoading | function | 加载状态回调 | `(loading) => setLoading(loading)` |
| dataPath | string | 数据路径，用于从响应中提取数据 | `'list.data'` |
| responseType | string | 响应类型，支持 blob 用于文件下载 | `'blob'` |

## 注意事项

1. **错误处理**: request 工具会在响应 success 为 false 时返回 Promise.reject，建议使用 try/catch 或 .catch() 捕获错误
2. **Loading 状态**: setLoading 会在请求开始时设为 true，结束时设为 false，自动管理加载状态
3. **数据提取**: 可通过 dataPath 指定从响应中提取的数据路径，默认返回 res.dataObject
4. **文件下载**: 当 responseType=blob 时，直接返回 blob 对象，需自行处理文件下载逻辑
5. **批量请求**: 使用 request.all() 方法可并行发送多个请求，提高性能
6. **请求参数**: GET 请求的参数可通过 URL 查询字符串传递，POST 请求的参数通过 data 传递
7. **响应处理**: 成功时直接返回提取的数据，无需再从 res.dataObject 中获取
8. **跨域处理**: 基于 @umijs/max 的 request，继承其跨域配置