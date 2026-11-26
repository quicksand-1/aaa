/**
 * HOC封装 DatePicker，使其可以自由的从 moment 转为 string 类型，反之怡然
 * @params
 *   format：moment 的时间格式
 *   type：组件类型，当 type=RangePicker 时，会渲染 DatePicker.RangePicker 组件，默认是 DatePicker 组件
 * */

import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { DateQuickProps } from '../types';
import _format from '../utils/_format';

const DateQuick = (props: DateQuickProps) => {
  const { value, format, type = '', disabledDate, ...rest } = props;
  const Component = !!type
    ? (DatePicker[type] as React.ComponentType<any>)
    : DatePicker;

  let momentedValue;
  if (Array.isArray(value)) {
    const [start, end] = value;
    momentedValue = [
      _format.moment(start, format),
      _format.moment(end, format),
    ];
  } else if (value) {
    momentedValue = _format.moment(value, format);
  } else {
    momentedValue = undefined;
  }

  return (
    <Component
      value={momentedValue}
      disabledDate={(current, info) => {
        if (typeof disabledDate === 'function') {
          return disabledDate?.(current, { ...info, dayjs });
        }

        if (typeof disabledDate !== 'string') {
          return false; // 默认不禁用
        }

        // 处理 string 模式
        const operator = disabledDate.includes('<') ? '<' : '>';
        const num = Number(disabledDate.replace(/[<>]/g, '').trim());
        const pivot = dayjs().startOf('day');

        // 默认按天计算
        if (rest.picker === undefined || rest.picker === 'date') {
          return operator === '<'
            ? current.isBefore(pivot.subtract(num, 'day'))
            : current.isAfter(pivot.add(num, 'day')); // >n = 禁用 n 天之后
        }

        // 按月计算
        if (rest.picker === 'month') {
          return operator === '<'
            ? current.isBefore(pivot.subtract(num, rest.picker))
            : current.isAfter(pivot.add(num, rest.picker));
        }
      }}
      {...rest}
    />
  );
};

export default DateQuick;
