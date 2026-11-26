# request 文档更新计划

## 任务概述
将 `.trae/examples/request_examples.md` 中的实际用例更新至 `docs/utils/request.md` 文档中。

## 更新原则
1. 保持现有排版结构
2. 确保更新的用例通俗易懂
3. 更新的用例不重复、不啰嗦
4. 基于源码实现，不包含不存在的功能

## 当前文档结构分析
- 后端接口返回数据格式
- API 文档（url、options）
- options 参数说明（setLoading、showError、responseType）
- 示例：仅 1 个简单 GET 请求

## 源码分析结果
通过阅读 `/src/fetch/request.ts` 源码，确认：
- request 是对 @umijs/max request 的二次封装
- 支持的 options 参数：setLoading、showError、responseType
- 当 responseType='blob' 时用于文件流下载
- **未发现 request.all 方法**，示例文件中的批量请求示例不包含在更新中

## 示例文件内容分析
包含 8 个分类：
1. 基础使用（简单 GET、带参数 GET）
2. 带 Loading 状态
3. POST 请求
4. DELETE 请求
5. 带查询参数
6. 带复杂数据结构
7. 文件下载（blob）
8. 批量请求（request.all）- **不包含，源码中不存在**

## 更新步骤

### 步骤 1：筛选有价值的用例
根据源码分析和实际使用场景，筛选以下用例：

#### 1.1 基础 GET 请求
- **保留理由**：当前文档已有简单示例，但可以补充带参数的示例
- **示例来源**：request_examples.md 第 1 节"基础使用"
- **需要调整**：
  - 简化示例，移除外部依赖（hide、after 函数）
  - 使用更通用的场景

#### 1.2 POST 请求
- **保留理由**：POST 请求是最常用的请求方式之一，文档中缺少示例
- **示例来源**：request_examples.md 第 3 节"POST 请求"
- **需要调整**：
  - 简化示例，移除外部依赖
  - 展示基本的 POST 请求用法

#### 1.3 DELETE 请求
- **保留理由**：DELETE 请求是常用的数据操作方式，文档中缺少示例
- **示例来源**：request_examples.md 第 4 节"DELETE 请求"
- **需要调整**：
  - 简化示例，移除外部依赖
  - 展示基本的 DELETE 请求用法

#### 1.4 带 Loading 状态
- **保留理由**：setLoading 是重要的功能，需要展示如何使用
- **示例来源**：request_examples.md 第 2 节"带 Loading 状态"
- **需要调整**：
  - 简化示例，展示基本的 loading 状态管理
  - 结合表单提交场景

#### 1.5 文件下载（blob）
- **保留理由**：responseType='blob' 是重要功能，文档中已提及但缺少示例
- **示例来源**：request_examples.md 第 7 节"文件下载（blob）"
- **需要调整**：
  - 简化示例，展示完整的文件下载流程
  - 确保示例可独立运行

### 步骤 2：设计新示例

#### 2.1 简单 GET 请求（保留现有示例，稍作调整）
```jsx | pure
import { request } from 'fintech';

request('/api/data.json').then((res) => {
  console.log('请求成功', res);
});
```

#### 2.2 带 URL 参数的 GET 请求
```jsx | pure
import { request } from 'fintech';

request(`/api/user/info.json?userCode=${userCode}`).then((res) => {
  console.log('用户信息', res);
});
```

#### 2.3 POST 请求
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

#### 2.4 DELETE 请求
```jsx | pure
import { request } from 'fintech';

request(`/api/delete.json?id=${id}`, {
  method: 'DELETE',
}).then((res) => {
  console.log('删除成功', res);
});
```

#### 2.5 带 Loading 状态的请求
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

#### 2.6 文件下载（blob）
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

### 步骤 3：更新 API 文档
根据源码分析，补充以下说明：

#### options 参数（需要补充 method 和 data）
| 参数    | 说明           | 类型            | 默认值 |
| :------ | :------------- | :-------------- | :----- |
| method     | 请求方法       | string          | 'GET' |
| data     | 请求数据       | object          |        |
| setLoading     | 设置 loading 状态       | React.Dispatch<Boolean> |        |
| showError     | 请求失败时是否展示错误信息，false 时不展示 | Boolean | true |
| responseType     | 响应数据类型，'blob' 时返回 File 类型 | string | 'json' |

### 步骤 4：执行更新
1. 保留现有的"后端接口返回数据格式"和"API"部分
2. 更新 options 参数说明，补充 method 和 data
3. 更新示例部分，添加新的示例
4. 保持文档的一致性和可读性

## 更新后的文档结构
```
# request

对 @umijs/max request 进行二次封装

## 后端接口返回数据格式
（保持不变）

## API
（保持不变）

### options
（更新：补充 method 和 data 参数）

## 示例
1. 简单 GET 请求（保留并调整）
2. 带 URL 参数的 GET 请求（新增）
3. POST 请求（新增）
4. DELETE 请求（新增）
5. 带 Loading 状态的请求（新增）
6. 文件下载（新增）
```

## 注意事项
1. 所有新示例必须可独立运行，不依赖外部函数或变量
2. 保持代码简洁，避免冗余
3. 确保示例代码符合项目代码规范
4. 保持文档的一致性和可读性
5. 不包含 request.all 方法，因为源码中不存在此功能
6. 示例中的 URL 使用 `/api/` 前缀，保持一致性
