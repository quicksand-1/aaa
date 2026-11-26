/**
 * 全局执行文件
 * 执行顺序：app.js > global.js
 * */

import dayjs from 'dayjs';
import { message, Tooltip } from 'antd';
import { Access, useAccess } from '@umijs/max';
import { localConfig, online, StatusTag, autoUpdate } from 'fintech';
import _deepGet from 'fintech/utils/_deepGet';
import request from '@/utils/request';
import { REGEXP } from '@/constants';

const multilineEllipsis = {
  tooltip: {
    styles: { container: { whiteSpace: 'pre-wrap' } },
  },
};

// Fintech 组件的配置文件
localConfig.config({
  request,
  publicPath: PUBLIC_PATH,
  access: { Access, useAccess },
  proTableAsync: {
    defaultExportTitle: '导出数据',
    // scroll: { y: window.innerHeight / 2 },
    column: (column) => {
      if (column.ellipsis === true) {
        column.ellipsis = multilineEllipsis;
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
        REGEXP.AMOUNT.test(column.dataIndex)
      ) {
        column.valueType = column.valueType || 'money';
        column.align = 'right';
        column.renderText = (t) => {
          return t?.amount || t;
        };
      }

      // 如果有禁用时间选择器
      if (column.fieldProps?.disabledDate2) {
        column.fieldProps.disabledDate = (current) => {
          return column.fieldProps?.disabledDate2(current, dayjs);
        };
      }

      // tip 数据展示
      if (column.tipIndex) {
        column.render = (dom, r) => {
          const v = _deepGet(r, column.tipIndex);
          return v ? (
            <Tooltip title={v}>
              <span style={{ textDecoration: 'underline' }}>{dom}</span>
            </Tooltip>
          ) : (
            dom
          );
        };
      }

      // tag 展示
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
    column: (column = {}) => {
      // 全局默认行为配置
    },
  },
});

// 网络监测
online();
// 自动检测项目是否有更新
autoUpdate(1000 * 60 * 5);

message.config({
  maxCount: 1, // 最多提示1个
  duration: 3, // 关闭延时
});
