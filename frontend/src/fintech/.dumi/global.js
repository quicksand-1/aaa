import localConfig from '../src/localConfig';
import autoUpdate from '../src/utils/autoUpdate';
import StatusTag from '../src/StatusTag';
import _deepGet from '../src/utils/_deepGet';
import request from './request';

localConfig.config({
  request,
  sm4: 'efcdab98765432100123456789abcdef',
  sm2: '',
  proTableAsync: {
    defaultExportTitle: '导出数据',
    scroll: { y: window.innerHeight / 2 },
    /**
     * columns 配置项，可根据项目自由组合
     * 以下是现有项目的一些参考
     * */
    column: (column) => {
      /**
       * 布尔类型格式化
       * @关键特点：
       *   - valueType = 'boolean'
       * */
      if (column.valueType === 'boolean' && !column.search) {
        column.renderText = (t) => (t ? '✅' : ' ');
      }

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
        /Amt|Bal|Amount$/.test(column.dataIndex)
      ) {
        column.valueType = column.valueType || 'money';
        column.align = 'right';
        column.renderText = (t) => {
          return t?.amount ?? t;
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
    },
  },
  descList: {
    column: (column) => {
      /**
       * 布尔类型自动转化
       * @关键特点：
       *   - valueType = 'boolean'
       * */
      if (column.valueType === 'boolean' && !column.search) {
        column.render = (t) => (t ? '✅' : ' ');
      }
    },
  },
});

// 自动检测项目是否有更新
autoUpdate(1000 * 60 * 5);
