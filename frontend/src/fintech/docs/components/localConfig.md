---
group: 配置
title: localConfig
order: 1
---

# localConfig

统一配置工具，配置方法如下：

```jsx | pure
import { localConfig } from 'fintech';
import _deepGet from 'fintech/utils/_deepGet';
import dayjs from 'dayjs';

const REG_AMOUNT = /(Amt|Bal|Amount)$/; // 金额匹配正则
localConfig.config({
  request,
  publicPath,
  sm4: '秘钥',
  sm2: '公钥',
  access: {
    Access,
    useAccess,
  },
  proTableAsync: {
    scroll: { y: window.innerHeight / 2 },
    /**
     * columns 配置项，可根据项目自由组合
     * 以下是现有项目的一些参考
     * */
    column: (column) => {
      /**
       * 金额类型格式化
       * @关键特点：money、amount、xxxAmt、xxxBal、xxxAmount
       * @dataIndex 匹配示例：
       *   - aidAgencySubAmount
       *   - writeOffPrinBal
       *   - ['encashAmt', 'amount']
       * */
      if (
        column.dataIndex?.includes('amount') ||
        REG_AMOUNT.test(column.dataIndex)
      ) {
        column.valueType = column.valueType || 'money';
        column.align = 'right';
        column.renderText = (t) => {
          return t?.amount ?? t;
        };
      }

      /**
       * 布尔类型自动转化
       * @关键特点：
       *   - valueType = 'boolean'
       * */
      if (column.valueType === 'boolean' && !column.search) {
        column.renderText = (t) => (t ? '✅' : ' ');
      }

      // 文本省略
      if (column.valueType === 'ellipsis') {
        column.renderText = (t) => `${t?.slice(0, 50)}...`;
      }

      /**
       * tip 数据展示
       * @异常情况：
       *   - 问题：原生的 column.ellipsis = true 时，文本太长时 hover 会有闪烁的情况
       *   - 解决：使用本配置项，配置 `ellipsis: { showTitle: false }` 即可
       * @关键特点：
       *   - column.tipIndex
       *   - 和 dataIndex 同级，同样支持嵌套写法
       * */
      if (column.tipIndex) {
        column.render = (dom, r) => {
          const v = _deepGet(r, column.tipIndex);
          return v ? (
            <Tooltip title={v} styles={{ root: { maxWidth: 650 } }}>
              <span style={{ textDecoration: 'underline' }}>{dom}</span>
            </Tooltip>
          ) : (
            dom
          );
        };
      }

      /**
       * tags 类型
       * @关键特点：
       *   - valueType = 'tags'
       * */
      if (column.valueType === 'tags') {
        column.render = (dom, r) => {
          return <TagList data={r[column.dataIndex]} {...column.fieldProps} />;
        };
      }

      /**
       * tag 展示
       * @关键特点：
       *   - valueType = 'tag'
       * */
      if (column.valueType === 'tag') {
        column.valueType = 'select';
        column.render = (_, r) => {
          return (
            <StatusTag
              value={_deepGet(r, column.dataIndex)}
              valueEnum={column.valueEnum}
            />
          );
        };
      }

      /**
       * 时间选择器可方便使用 dayjs
       * */
      if (column.fieldProps?.disabledDate2) {
        column.fieldProps.disabledDate = (current) => {
          return column.fieldProps?.disabledDate2(current, dayjs);
        };
      }
    },
  },
  descList: {
    column: (column) => {
      /**
       * 金额类型格式化
       * @关键特点：money、amount、xxxAmt、xxxBal、xxxAmount
       * @dataIndex 匹配示例：
       *   - aidAgencySubAmount
       *   - writeOffPrinBal
       *   - ['encashAmt', 'amount']
       * */
      if (
        column.dataIndex?.includes('amount') ||
        REG_AMOUNT.test(column.dataIndex)
      ) {
        column.valueType = column.valueType || 'money';
      }
    },
  },
});
```

## API

| 参数          | 说明                                            | 类型    | 默认值 |
| :------------ | :---------------------------------------------- | :------ | :----- |
| request       | 统一请求函数，Table 等组件内部会进行使用        | request |        |
| access        | umi@max 的权限内容                              |         |        |
| publicPath    | webpack 的 publicPath，在动态引入静态资源时使用 | string  | /      |
| proTableAsync | ProTableAsync 组件的配置信息                    | props   |        |
| descList      | DescList 组件的配置信息                         | props   |        |
| sm4           | SM4 秘钥                                        | string  |        |
| sm2           | SM2 公钥                                        | string  |        |
