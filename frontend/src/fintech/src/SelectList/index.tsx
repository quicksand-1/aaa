/**
 * SelectList 组件主入口
 * 用于根据不同的 props 类型渲染不同的选择列表组件
 *
 * @example
 * // 基础用法
 * <SelectList options={{ CHINA: '中国', USA: '美国' }} />
 *
 * // 异步数据加载
 * <SelectList url="/api/countries" fields={['code', 'name']} />
 *
 * // 字典数据集成
 * <SelectList dictKey="userType" />
 *
 * // 使用字典 Hook
 * const { dictEnum, dictFun } = SelectList.useDict({ dictKey: 'userType' });
 */

import type { SelectListAsyncProps } from '../types';
import Async from './async';
import Base from './base';
import useDict from './useDict';

/**
 * SelectList 主组件
 * 根据提供的 props 类型渲染不同的子组件
 *
 * @param {SelectListAsyncProps} props - 组件属性
 * @param {string} [props.url] - 请求地址，提供时渲染 Async 组件
 * @param {string} [props.dictKey] - 字典键值，提供时渲染带字典数据的 Async 组件
 * @param {any} [props.rest] - 其他属性，传递给子组件
 * @returns {React.ReactNode} - 渲染的选择列表组件
 */
const SelectList = (props: SelectListAsyncProps) => {
  const { url, dictKey, ...rest } = props;

  // 如果提供了 url，渲染异步数据加载组件
  if (url) {
    return <Async url={url} {...rest} />;
  }

  // 如果提供了 dictKey，渲染带字典数据的异步组件
  if (dictKey) {
    return (
      <Async
        localSearch
        fields={['dictKey', 'dictName']}
        url={`/system/dict/select/${dictKey}.json`}
        {...rest}
      />
    );
  }

  // 默认渲染基础选择列表组件
  return <Base {...rest} />;
};

/**
 * 字典数据集成 Hook
 * 用于加载和处理字典数据
 *
 * @static
 * @param {Object} options - Hook 选项
 * @param {string} options.dictKey - 字典键值
 * @param {boolean} [options.manualRequest=false] - 是否手动请求数据
 * @returns {Object} - 字典数据和相关方法
 * @returns {Object} returns.dictEnum - 枚举对象
 * @returns {Array} returns.data - 字典数据列表
 * @returns {Function} returns.dictFun - 获取字典值的函数
 * @returns {Function} returns.run - 手动加载字典数据的函数
 */
SelectList.useDict = useDict;

export default SelectList;
