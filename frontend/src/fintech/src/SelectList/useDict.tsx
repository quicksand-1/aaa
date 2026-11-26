/**
 * SelectList 字典数据集成 Hook
 * 用于加载和处理字典数据，返回枚举对象和相关方法
 *
 * @example
 * // 自动加载字典数据
 * const { dictEnum, data, dictFun } = SelectList.useDict({ dictKey: 'userType' });
 *
 * // 手动加载字典数据
 * const { dictEnum, data, dictFun, run } = SelectList.useDict({
 *   dictKey: 'userType',
 *   manualRequest: true
 * });
 *
 * // 使用字典值
 * <div>管理员：{dictFun('admin')}</div>
 */

import { useEffect, useState } from 'react';
import request from '../fetch/request';

/**
 * 字典数据集成 Hook
 * 加载和处理字典数据，返回枚举对象和相关方法
 *
 * @param {Object} options - Hook 选项
 * @param {string} [options.dictKey=''] - 需要加载的字典键值
 * @param {boolean} [options.manualRequest=false] - 是否手动请求数据，默认自动请求
 * @returns {Object} - 字典数据和相关方法
 * @returns {Object} returns.dictEnum - 枚举对象，{ key: value, key2: value2 }
 * @returns {Array} returns.data - 字典数据列表，后端返回的原始内容
 * @returns {Function} returns.dictFun - 根据 key 获取字典值的函数
 * @returns {Function} returns.run - 手动加载字典数据的函数
 */
export default ({ dictKey = '', manualRequest = false }) => {
  // 字典枚举对象，用于快速查找字典值
  const [dictEnum, setDictEnum] = useState({});
  // 字典数据列表，后端返回的原始数据
  const [data, setData] = useState<Record<any, any>[]>([]);

  /**
   * 加载字典数据
   * 发送请求获取字典数据，处理后更新状态
   */
  const run = () => {
    // 构建字典数据请求 URL
    request(`/system/dict/select/${dictKey}.json`).then(
      (res: Record<any, any>[]) => {
        // 将数组格式的字典数据转换为枚举对象
        const objEnum = res?.reduce((p, c) => {
          return {
            ...p,
            [c.dictKey]: c.dictName, // 使用 dictKey 作为键，dictName 作为值
          };
        }, {});

        // 更新字典数据状态
        setData(res);
        // 更新枚举对象状态
        setDictEnum(objEnum);
      },
    );
  };

  /**
   * 组件挂载时的副作用
   * 根据 manualRequest 决定是否自动加载数据
   */
  useEffect(() => {
    if (!manualRequest) {
      run();
    }
  }, []);

  /**
   * 根据 key 获取字典值
   * 如果找不到对应的字典值，返回原始 key
   *
   * @param {string} key - 字典键值
   * @returns {string} - 字典值或原始 key
   */
  const dictFun = (key: string) => {
    return dictEnum[key as keyof typeof dictEnum] || key;
  };

  // 返回字典数据和相关方法
  return { dictEnum, data, dictFun, run };
};
