/**
 * SelectList 异步数据加载组件
 * 基于基础组件，添加异步数据加载、搜索防抖、请求缓存等功能
 *
 * @example
 * // 加载时请求数据
 * <SelectList
 *   url="/api/countries"
 *   fields={['code', 'name']}
 *   placeholder="请选择国家"
 * />
 *
 * // 聚焦时请求数据
 * <SelectList
 *   url="/api/countries"
 *   trigger="focus"
 *   fields={['code', 'name']}
 *   placeholder="请选择国家"
 * />
 *
 * // 搜索时请求数据
 * <SelectList
 *   url="/api/search?keyword="
 *   trigger="search"
 *   fields={['code', 'name']}
 *   placeholder="请选择国家（支持搜索）"
 * />
 */

import { useEffect, useRef, useState } from 'react';
import cacheRequest from '../fetch/cacheRequest';
import useDebounce from '../hooks/useDebounce';
import type { SelectListAsyncProps } from '../types';
import Base from './base';

/**
 * Async 组件
 * 处理异步数据加载、搜索防抖、请求缓存等逻辑
 *
 * @param {SelectListAsyncProps} props - 组件属性
 * @param {string} [props.url=''] - 请求地址
 * @param {string} [props.dataPath] - 源数据路径
 * @param {object} [props.params={}] - 请求参数
 * @param {string} [props.trigger='load'] - 触发模式：load/focus/search
 * @param {function} [props.formatData] - 数据格式化函数
 * @param {function} [props.searchFormat] - 搜索参数格式化函数
 * @param {boolean} [props.firstRequest=false] - 首次是否触发请求（仅 search 模式）
 * @param {boolean} [props.cache=false] - 是否开启缓存
 * @param {any} [props.rest] - 其他属性，传递给基础组件
 * @returns {React.ReactNode} - 渲染的异步选择列表组件
 */
const Async = (props: SelectListAsyncProps) => {
  const {
    url = '',
    dataPath,
    params = {},
    trigger = 'load',
    formatData,
    searchFormat,
    firstRequest = false,
    cache = false,
    ...rest
  } = props;

  // 引用基础组件的 actionRef，用于获取拼音输入状态
  const actionRef = useRef();
  // 标记是否已经聚焦过，用于 focus 触发模式
  const focusedOnce = useRef<boolean>(false);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 异步加载的数据
  const [data, setData] = useState([]);

  /**
   * 请求数据函数
   * 处理异步数据请求，支持缓存和格式化
   *
   * @param {string} [search=''] - 搜索关键词
   */
  const query = (search = '') => {
    // 如果没有提供 url，直接返回
    if (!url) return;

    // 构建完整的请求 URL，添加搜索参数
    const newUrl = `${url}${searchFormat?.(search) || ''}${search}`;

    // 使用缓存请求函数，支持缓存和加载状态管理
    cacheRequest(newUrl, {
      cache, // 是否开启缓存
      setLoading, // 加载状态回调
      dataPath, // 数据路径
      params, // 请求参数
    }).then((res: any) => {
      // 格式化数据（如果提供了格式化函数）
      const d = formatData ? formatData(res) : res;
      // 更新数据状态
      setData(d);
    });
  };

  /**
   * 聚焦回调函数
   * 用于 focus 触发模式，首次聚焦时请求数据
   */
  const onFocus = () => {
    if (trigger === 'focus' && !focusedOnce.current) {
      focusedOnce.current = true;
      query();
    }
  };

  /**
   * 搜索回调函数
   * 使用防抖处理，优化搜索性能
   */
  const onSearch = useDebounce((v = '') => {
    // 当前是搜索模式，且复合文本输入结束后发起请求
    // @ts-ignore
    if (trigger === 'search' && !actionRef?.current?.isComposing) {
      query(v);
    }
  });

  /**
   * 组件挂载时的副作用
   * 根据触发模式和 firstRequest 决定是否立即请求数据
   */
  useEffect(() => {
    if (trigger === 'load' || (trigger === 'search' && firstRequest)) {
      query();
    }
  }, []);

  /**
   * 清空回调函数
   * 清空搜索框后，触发搜索（搜索模式下）
   */
  const onClear = () => {
    // 清空搜索框后，调用 onSearch，触发请求
    onSearch('');
    // 调用父组件传递的 onClear 回调
    rest.onClear?.();
  };

  return (
    <Base
      allowClear // 允许清空
      placeholder="请选择" // 默认占位符
      {...rest} // 其他属性
      showSearch // 显示搜索框
      loading={loading} // 加载状态
      options={data?.length > 0 ? data : rest.options} // 数据（优先使用异步加载的数据）
      onFocus={onFocus} // 聚焦回调
      onSearch={onSearch} // 搜索回调
      onClear={onClear} // 清空回调
      actionRef={actionRef} // 引用，用于获取拼音输入状态
    />
  );
};

export default Async;
