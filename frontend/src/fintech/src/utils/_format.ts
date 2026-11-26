/**
 * 表单组件的双向 format 转化，以减少业务代码中前后端的过滤操作
 * 1、需要搭配 Form.Item 的 normalize 属性来使用
 * */
import dayjs from 'dayjs';
import _typeOf from './_typeOf';

/**
 * 场景介绍：一般在使用 Checkbox 选择多项时，表单最后输出项都是数组，而后端一般都只需要字符串结构的
 * 1、用此方法可抹平前后端数据结构不同造成的相互转化问题
 * */
const checkbox = (value: any) => {
  if (Array.isArray(value)) {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value.split(',');
  }

  return value;
};

/**
 * 场景介绍：自动将 moment 对象和 string 之间做转化
 * */

// 判断是否为 dayjs 对象
function isDayjsInstance(obj: any) {
  return (
    typeof obj === 'object' && obj !== null && typeof obj.format === 'function'
  );
}

// 兼容 20240711 的日期格式
function transformDateString(string: string) {
  if (string.includes('-')) {
    return string;
  }
  return string.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
}

// 进行自动转化
const autoMoment = (value: any, format = 'YYYY-MM-DD') => {
  const isDayjs = isDayjsInstance(value);
  const dayjsValue = isDayjs
    ? value
    : dayjs(transformDateString(value), format);

  return isDayjsInstance(dayjsValue)
    ? isDayjs
      ? value.format(format)
      : dayjsValue
    : undefined;
};

/**
 * 将各种各样的 options 格式，转成标准的 { label, value, options? } 格式
 * */
const options: any = ({
  data,
  fields = ['value', 'label'],
  optionRender,
}: any) => {
  let optionsList = [];

  if (Array.isArray(data)) {
    optionsList = data.map((i) => {
      const isObject = _typeOf(i, 'Object');
      const newObject = {
        // @ts-ignore
        ...(isObject ? i : {}),
        // @ts-ignore
        value: isObject ? i[fields[0]] : i,
        // @ts-ignore
        label: isObject ? (optionRender ? optionRender(i) : i[fields[1]]) : i,
      };

      if (fields[2] && isObject) {
        newObject.options = options(i[fields[2]], fields);
      }

      return newObject;
    });
  }

  if (_typeOf(data, 'Object')) {
    optionsList = Object.entries(data).map(([key, value]) => ({
      value: key,
      label: value,
    }));
  }

  return optionsList;
};

export default {
  checkbox,
  moment: autoMoment,
  options,
};
