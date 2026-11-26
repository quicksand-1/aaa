// @ts-nocheck
/* eslint-disable */
/**
 * @params
 *   from<string>：需要执行的表名
 *   where<string>：搜索条件，比如：id=406ac;status=init，表示同时满足 id 和 status
 *   values<object | object[]>：需要更新或插入的数据
 * */

import _deepGet from './_deepGet';
import typeOf from './_typeOf';
import genNewID from './genNewID';
import intlDate from './intlDate';
import regexp from './regexp';

const container = {
  /**
   * 获取某张表的数据，如果没有设置表名，则从 default 表中获取
   * from：表名
   * where：匹配条件
   * */
  _query({ from, where }) {
    try {
      const all = JSON.parse(localStorage.getItem(from || 'default')) || [];

      return where
        ? all.filter((item) => this._matchWhere({ where, record: item }))
        : all;
    } catch (e) {
      return [];
    }
  },

  /**
   * 设置某张表的数据，如果没有设置表名，则从 default 表中设置
   * */
  _set({ from, values = [] }) {
    localStorage.setItem(from || 'default', JSON.stringify(values));
  },

  /**
   * 转化搜索条件，将 'id=123' 转成 ['id', '=', '123']
   * 支持条件
   *   =：精准等于
   *   ×：不等于
   *   ≈：模糊匹配
   *   >：大于
   *   <：小于
   *   ≥：大于等于
   *   ≤：小于等于
   * */
  _where({ where = '' }) {
    return where.split(';').reduce((acc, pair) => {
      const match = pair.match(/([^\s]+)([×=≈><≥≤])([\s\S]+)$/);

      if (match) {
        const [, key, operator, values] = match;
        values.split(',').forEach((value) => {
          acc.push([key, operator, value.trim()]);
        });
      }
      return acc;
    }, []);
  },

  /**
   * 匹配搜索条件
   * where：匹配条件，可能是多个
   * record：匹配的原始数据
   * */
  _matchWhere({ where = '', record = {} }) {
    return this._where({ where }).every(([key, symbol, value]) => {
      let curValue = (_deepGet(record, key) || '').toString().toLowerCase();
      let curValue2 = (value || '').trim().toLowerCase();

      // 当匹配的条件值不存在时，直接返回 true
      if (curValue2 === 'undefined') {
        return true;
      }

      if (symbol === '=') {
        return curValue === curValue2;
      }

      if (symbol === '×') {
        return curValue !== curValue2;
      }

      if (symbol === '≈') {
        return curValue.includes(curValue2);
      }

      try {
        // 看是否能转化为时间格式
        curValue = this._dateTime(curValue);
        curValue2 = this._dateTime(curValue2);
      } catch (e) {
        // 无法转化为时间格式，则使用原始值进行判断
      }

      if (symbol === '>') {
        return +curValue > +curValue2;
      }

      if (symbol === '<') {
        return +curValue < +curValue2;
      }

      if (symbol === '≥') {
        return +curValue >= +curValue2;
      }

      if (symbol === '≤') {
        return +curValue <= +curValue2;
      }

      return false;
    });
  },

  // 获取当前时间
  _date() {
    return intlDate.format(new Date());
  },

  // 将时间格式转化为毫秒数
  _dateTime(string = '') {
    try {
      return new Date(string).getTime();
    } catch (e) {
      throw '_dateTime 方法入参格式错误';
    }
  },

  /**
   * 根据条件进行排序操作
   * orderBy：指定的字段
   * sort：排序方向；ASC=升序、DESC=降序
   * */
  _sort({ data = [], orderBy = 'createTime', sort = 'ASC' }) {
    return data.sort((a, b) => {
      const start = sort === 'ASC' ? a : b;
      const end = sort === 'DESC' ? a : b;

      // 如果是数字类型的
      if (regexp.NUMBER.test(a[orderBy])) {
        return +start[orderBy] - +end[orderBy];
      }

      // 如果是时间格式
      try {
        return this._dateTime(start[orderBy]) - this._dateTime(end[orderBy]);
      } catch (e) {
        return 1;
      }
    });
  },

  /**
   * 根据指定的字段名，筛选符合 value 值的数据
   * key: 字段名，默认 id
   * value: 一个字符串数组，一般是 id 数组
   * data: 需要过滤的原始数据
   * */
  _inside({ key = 'id', value = [], data = [] }) {
    return data.filter((item) => value.includes(item[key]));
  },

  /**
   * 序列化对应字段内容
   * demo: [{ id: 1 }, { id: 2 }] => [1, 2]
   * */
  _sequence({ data = [], sequence = 'id' }) {
    return data.map((i) => _deepGet(i, sequence));
  },

  /**
   * 查询某个表的数据，返回一个列表
   * */
  select({ from = '', where, orderBy, sort, sequence, inside }) {
    const all = this._query({ from, where });

    if (inside) {
      return this._inside({ ...inside, data: all });
    }

    if (sequence) {
      return this._sequence({ data: all, sequence });
    }

    return orderBy
      ? this._sort({
          data: all,
          orderBy,
          sort,
        })
      : all;
  },

  /**
   * 查询某张表中匹配条件的数据
   * */
  find({ from = '', where = '', defaultObject = {} }) {
    const obj = this._query({ from, where })[0] || {};

    return {
      ...defaultObject,
      ...obj,
    };
  },

  /**
   * 向表中插入一组新数据
   * @values<Record | Record[]>
   * PS：会自动创建 id、createTime
   * */
  insert({ from = '', values = {} }) {
    const all = this._query({ from });
    const createTime = this._date();

    const vs = Array.isArray(values) ? values : [values];

    vs.forEach((item) => {
      all.push({
        ...item,
        createTime,
        id: item.id || genNewID(),
      });
    });

    this._set({ from, values: all });
    return storageSQL;
  },

  /**
   * 更新表中某一行数据
   * */
  update({ from = '', where = '', values = {} }) {
    const all = this._query({ from }).map((item) => {
      // 当匹配条件时
      if (this._matchWhere({ where, record: item })) {
        return {
          ...item,
          ...values,
          modifyTime: this._date(),
        };
      }
      return item;
    });

    this._set({ from, values: all });
    return storageSQL;
  },

  /**
   * 匹配则更新，否则插入
   * */
  duplicate({ from = '', where = '', values = {} }) {
    const newWhere = where.replaceAll('undefined', 'null');
    const findObject = this.find({ from, where: newWhere });

    if (findObject.id) {
      // 存在，则更新
      return this.update({ from, where, values });
    } else {
      // 不存在，则新插入
      return this.insert({ from, values });
    }
  },

  /**
   * 删除某一行数据
   * */
  delete({ from = '', where = '' }) {
    const all = this._query({ from }).filter(
      (item) => !this._matchWhere({ where, record: item }),
    );

    this._set({ from, values: all });
    return storageSQL;
  },

  /**
   * 表删除操作
   * @from<all | string | string[]>
   * */
  drop({ from }) {
    if (from === 'all') {
      localStorage.clear();
    }

    if (typeOf(from, 'String')) {
      localStorage.removeItem(from);
    }

    if (typeOf(from, 'Array')) {
      from.forEach((k) => {
        localStorage.removeItem(k);
      });
    }

    return storageSQL;
  },

  /**
   * 表重命名
   * */
  rename({ oldName, newName }) {
    try {
      const oldValue = localStorage.getItem(oldName);
      const newValue = localStorage.getItem(newName);
      if (oldValue && !newValue) {
        localStorage.removeItem(oldName);
        localStorage.setItem(newName, oldValue);
      }
    } catch (e) {
      throw e;
    }
  },
};

const storageSQL = (type = '', params = {}) => {
  if (typeOf(type, 'Function')) {
    type();
    return storageSQL;
  } else {
    return container[type](params);
  }
};

export default storageSQL;
