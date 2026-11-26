/**
 * 封装 Checkbox.Group，使其支持各种数据格式
 * @params
 *   options：源数据，支持格式如下：
 *     ['中国', '美国', '日本']
 *     { china: '中国', usa: '美国', japan: '日本' }
 *     [{ key: 'china', name: '中国', disabled: true },{ key: 'usa', name: '美国' },{ key: 'japan', name: '日本' }]
 *   fields['key', 'name']：自定义 value、label 属性，会自动将源数据中的对应自动设置成组件需要的 value 和 label，只在第三种源数据情况下该字段才生效
 * */

import type { CheckboxProps } from 'antd';
import { Checkbox } from 'antd';
import type { Options } from '../types';
import _filter from '../utils/_filter';
import _format from '../utils/_format';

// @ts-ignore
export interface CheckListProps extends CheckboxProps {
  fields?: [string, string];
  options?: Options;
  direction?: 'vertical';
  delimiter?: string;
}

const CheckList = (props: CheckListProps) => {
  const { options = [], fields, direction, delimiter, ...rest } = props;

  let defaultProps = {};
  if (delimiter) {
    defaultProps = {
      value: rest.value ? rest.value.split(delimiter) : [],
      onChange: (checkedValues = []) => {
        // 将数组转为字符串用于提交
        const newValue: string = checkedValues.join(delimiter);
        // @ts-ignore
        rest.onChange?.(newValue);
      },
    };
  }

  const formatOptions = _format.options({ data: options, fields });
  const filterOptions: any = _filter(formatOptions);

  return (
    // @ts-ignore
    <Checkbox.Group
      {...rest}
      {...defaultProps}
      options={filterOptions}
      style={
        direction === 'vertical'
          ? {
              display: 'flex',
              flexDirection: 'column',
            }
          : undefined
      }
    />
  );
};

export default CheckList;
