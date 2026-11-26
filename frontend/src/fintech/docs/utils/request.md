---
group: 请求
toc: content
order: 1
---

# request

对 @umijs/max request 进行二次封装

## 后端接口返回数据格式

request 会自动判断 success=true 的情况，并返回 dataObject 内容。

```json | pure
{
  "success": true, // 是否成功
  "dataObject": {}, // 数据对象，any 类型
  "errorCode": "DENY", // 错误码
  "errorMessage": "error message" // 错误信息
}
```

## API

request(url, options)

| 参数    | 说明           | 类型   | 默认值 |
| :------ | :------------- | :----- | :----- |
| url     | 请求地址       | string |        |
| options | 请求的额外参数 | object |        |

### options

| 参数         | 说明                                       | 类型                    | 默认值 |
| :----------- | :----------------------------------------- | :---------------------- | :----- |
| method       | 请求方法                                   | string                  | 'GET'  |
| data         | 请求数据                                   | object                  |        |
| setLoading   | 设置 loading 状态                          | React.Dispatch<Boolean> |        |
| showError    | 请求失败时是否展示错误信息，false 时不展示 | Boolean                 | true   |
| responseType | 响应数据类型，'blob' 时返回 File 类型      | string                  | 'json' |

## 示例

示例 1: 简单 GET 请求

```jsx | pure
import { request } from 'fintech';

request('/api/data.json').then((res) => {
  console.log('请求成功', res);
});
```

示例 2: 带 URL 参数的 GET 请求

```jsx | pure
import { request } from 'fintech';

request(`/api/user/info.json?userCode=${userCode}`).then((res) => {
  console.log('用户信息', res);
});
```

示例 3: POST 请求

```jsx | pure
import { request } from 'fintech';

request('/api/save.json', {
  method: 'POST',
  data: {
    name: '张三',
    age: 25,
  },
}).then((res) => {
  console.log('保存成功', res);
});
```

示例 4: DELETE 请求

```jsx | pure
import { request } from 'fintech';

request(`/api/delete.json?id=${id}`, {
  method: 'DELETE',
}).then((res) => {
  console.log('删除成功', res);
});
```

示例 5: 带 Loading 状态的请求

```jsx | pure
import { request } from 'fintech';

const [loading, setLoading] = useState(false);

const handleSubmit = (values) => {
  request('/api/submit.json', {
    method: 'POST',
    data: values,
    setLoading,
  }).then((res) => {
    console.log('提交成功', res);
  });
};
```

示例 6: 文件下载（blob）

```jsx | pure
import { request } from 'fintech';

const handleDownload = () => {
  request('/api/download/file', {
    responseType: 'blob',
    method: 'GET',
  }).then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filename.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  });
};
```
