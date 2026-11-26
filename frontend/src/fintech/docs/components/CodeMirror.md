---
group: 通用
title: CodeMirror
order: 4
---

代码编辑器，目前仅支持 SQL

## 组件资源依赖

- `注意：组件依赖 codemirror.js、codemirror.sql.js、codemirror.css，请确保 public/assets 目录下有该资源`
- <a href="/assets/codemirror.js" download="codemirror.js">
  codemirror.js</a>、<a href="/assets/codemirror.css" download="codemirror.css">
  codemirror.css</a>、<a href="/assets/codemirror.sql.js" download="codemirror.sql.js">codemirror.sql.js</a>

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { CodeMirror } from 'fintech';

export default () => {
  return (
    <CodeMirror
      id="mirror"
      value={`SELECT \n    TRANS.TRANS_DATE \"交易日\", \n    CASE \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_BIZ_GRANT' THEN '放款户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_BIZ_REPAY' THEN '业务户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_TRUSTEESHIP' THEN '托管户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_COLLECTIONS' THEN '代收户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_BIZ_GATHER' THEN '摊还期还款收款户' \n        ELSE SUB_ACCOUNT_TYPE \n    END AS \"账户类型\", \n    TRANS.ACCOUNT_NO \"账户\", \n    TRANS.INITIAL_BALANCE/100 \"期初余额\", \n    TRANS.FINAL_BALANCE/100 \"期末余额\" \nFROM TMP_FINAL_bank_RESULT1 TRANS \nLEFT JOIN AC_SE_BANK_ACCOUNT ACCOUNT \n    ON TRANS.ACCOUNT_NO = ACCOUNT.ACCOUNT_NO\n  order by 2,1`}
    />
  );
};
```

```jsx
/**
 * title: autoHeight
 */
import React from 'react';
import { CodeMirror } from 'fintech';

export default () => {
  return (
    <CodeMirror
      id="mirror2"
      autoHeight
      value={`SELECT \n    TRANS.TRANS_DATE \"交易日\", \n    CASE \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_BIZ_GRANT' THEN '放款户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_BIZ_REPAY' THEN '业务户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_TRUSTEESHIP' THEN '托管户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_COLLECTIONS' THEN '代收户' \n        WHEN SUB_ACCOUNT_TYPE = 'BANK_BIZ_GATHER' THEN '摊还期还款收款户' \n        ELSE SUB_ACCOUNT_TYPE \n    END AS \"账户类型\", \n    TRANS.ACCOUNT_NO \"账户\", \n    TRANS.INITIAL_BALANCE/100 \"期初余额\", \n    TRANS.FINAL_BALANCE/100 \"期末余额\" \nFROM TMP_FINAL_bank_RESULT1 TRANS \nLEFT JOIN AC_SE_BANK_ACCOUNT ACCOUNT \n    ON TRANS.ACCOUNT_NO = ACCOUNT.ACCOUNT_NO\n  order by 2,1`}
    />
  );
};
```

## API

| 参数       | 说明                                     | 类型                | 默认值 |
| :--------- | :--------------------------------------- | :------------------ | :----- |
| mode       | 编辑器模式，目前仅支持 sql               | string              | sql    |
| id         | 编辑器编号，必填项                       | string              | mirror |
| value      | 初始值，常见于 form 表单回显             | string              | -      |
| onChange   | 编辑器值发生改变时触发                   | (v: string) => void | -      |
| height     | 编辑器高度                               | number              | 100    |
| config     | 编辑器配置项                             | CodeMirrorParams    | -      |
| autoHeight | 高度自适应，会根据输入内容来动态调整高度 | boolean             | false  |
