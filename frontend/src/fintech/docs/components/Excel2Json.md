---
group: 通用
title: Excel2Json
order: 10
---

# Excel2Json

读取 excel 文件并将内容转成 json 格式

## 组件资源依赖

- `注意：组件依赖 xlsx.js，请确保 public/assets/xlsx.js 有该资源`
- <a href="/assets/xlsx.js" download="xlsx.js">xlsx.js</a>

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { Button } from 'antd';
import { Excel2Json } from 'fintech';

export default () => {
  return (
    <Excel2Json
      templateUrl="template/excel2json.xlsx"
      rules={[
        {
          sheetName: 'Sheet1',
          map: {
            姓名: 'name',
            年龄: 'age',
            性别: 'gender',
            省: ['citys', 'province'],
            市: ['citys', 'city'],
          },
          enums: {
            gender: { male: '男', female: '女' },
          },
          format: (record) => ({ ...record, formatValue: 'demo' }),
        },
      ]}
      onFinish={(res) => {
        console.log(res);
      }}
    >
      <Button>读取 Excel 文件</Button>
    </Excel2Json>
  );
};
```

## API

| 参数        | 说明                                                    | 类型          | 默认值 |
| :---------- | :------------------------------------------------------ | :------------ | :----- |
| children    | 包裹的按钮组件，一般是 Button 或 LinkBtn                | ReactNode     |        |
| templateUrl | 模版文件，一般是 public 目录下的文件，也可以是 cdn 地址 | string        |        |
| onFinish    | 解析结束后返回的数据，只会解析 rules 配置的内容         | function(res) |        |
| rules       | 解析规则                                                | RuleItem[ ]   |        |

### RuleItem

| 参数        | 说明                                           | 类型               | 默认值 |
| :---------- | :--------------------------------------------- | :----------------- | :----- |
| sheetName   | 需要解析的 sheet 页                            | string             |        |
| map         | excel 中页头的中文和英文的对照表，支持嵌套路径 | object             |        |
| enums       | 枚举值，比如有些数据是需要转成枚举内容的       | object             |        |
| defaultData | 默认添加的数据                                 | Record             |        |
| format      | 格式化函数，对每一条数据进行自定义格式化       | (record) => record |        |
