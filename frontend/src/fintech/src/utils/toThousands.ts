// @ts-nocheck
import regexp from './regexp';

/**
 * 将数字或字符串数字转成千位符的样子
 * */
function toThousands(v = 0, figures = 20) {
  if (typeof +v === 'number' && !isNaN(v)) {
    return Number(v).toLocaleString('en', {
      minimumFractionDigits: 0,
      maximumFractionDigits: figures,
    });
  } else {
    try {
      return +v.replace(/\$\s?|(,*)/g, '');
    } catch (e) {
      // console.error(`Warning: [toThousands] Parameter type error`);
      return false;
    }
  }
}

/**
 * 人民币展示，如果单位是中文，则添加到值的后面，反之则添加到值的前面
 * */
function money(number, unit = '￥') {
  const value = toThousands(number, 2);

  regexp.CHINESE.lastIndex = 0;
  if (regexp.CHINESE.test(unit)) {
    return `${value}${unit}`;
  }

  return `${unit}${value}`;
}

/**
 * 元/万元之间的相互转化
 * @params
 *   number：实际值
 *   up：当为 true 时，会将 number*10000，反之则 number/10000
 *   unit：是否携带单位
 * */
function wanYuan(number, up = true, unit = false) {
  if (number !== undefined) {
    const value = up ? +number * 10000 : +number / 10000;

    return unit ? money(value, up ? '元' : '万元') : value;
  }
}

/**
 * 百分比和真实值之间的转化
 * @params
 *   number：实际值
 *   up：当为 true 时，会将 number*100，反之则 number/100
 *   unit：是否携带单位
 * */
function percent(number, up = true, unit = false) {
  if (regexp.NUMBER.test(number)) {
    const value = up ? (+number * 100).toLocaleString() : +number / 100;

    return unit ? `${value}%` : value;
  }
}

toThousands.money = money;
toThousands.wanYuan = wanYuan;
toThousands.percent = percent;

export default toThousands;
