/**
 * 封装 Radio.Group，使其支持各种数据格式
 * @params
 *   options：源数据，支持格式如下：
 *     ['中国', '美国', '日本']
 *     { china: '中国', usa: '美国', japan: '日本' }
 *     [{ key: 'china', name: '中国', disabled: true },{ key: 'usa', name: '美国' },{ key: 'japan', name: '日本' }]
 *   fields['key', 'name']：自定义 value、label 属性，会自动将源数据中的对应自动设置成组件需要的 value 和 label，只在第三种源数据情况下该字段才生效
 * */

import type { RadioGroupProps } from 'antd';
import { Radio } from 'antd';
import type { Options } from '../types';
import _filter from '../utils/_filter';
import _format from '../utils/_format';

interface FormatOptionsParams {
  data: Options;
  fields?: [string, string];
}

export interface CheckListProps extends Omit<RadioGroupProps, 'options'> {
  fields?: [string, string];
  options?: Options;
  direction?: 'vertical';
}

const verticalStyle = {
  display: 'flex',
  flexDirection: 'column',
} as const;

const RadioList = (props: CheckListProps) => {
  const { options = [], fields, direction, ...rest } = props;

  const formatOptions = _format.options({
    data: options,
    fields,
  } as FormatOptionsParams);
  const filterOptions: any = _filter(formatOptions);

  return (
    <Radio.Group
      options={filterOptions}
      style={direction === 'vertical' ? verticalStyle : undefined}
      {...rest}
    />
  );
};

export default RadioList;
