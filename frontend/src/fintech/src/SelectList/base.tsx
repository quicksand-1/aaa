/**
 * SelectList 基础组件
 * 封装 antd Select 组件，使其支持各种数据格式、本地搜索、自定义渲染等功能
 *
 * @example
 * // 基础用法
 * <SelectList
 *   options={{ CHINA: '中国', USA: '美国' }}
 *   placeholder="请选择国家"
 * />
 *
 * // 带本地搜索
 * <SelectList
 *   options={['中国', '美国', '日本']}
 *   localSearch
 *   placeholder="请选择国家（支持搜索）"
 * />
 *
 * // 自定义字段映射
 * <SelectList
 *   options={[{ code: 'CHINA', name: '中国' }, { code: 'USA', name: '美国' }]}
 *   fields={['code', 'name']}
 *   placeholder="请选择国家"
 * />
 */

import { Divider, Select } from 'antd';
import { useImperativeHandle, useMemo } from 'react';
import useComposing from '../hooks/useComposing';
import LinkBtn from '../LinkBtn';
import type { SelectListProps } from '../types';
import _filter from '../utils/_filter';
import _format from '../utils/_format';

/**
 * 替换字符串中指定的符号
 * 用于本地搜索时的字符串处理
 *
 * @param {string} string - 原始字符串
 * @param {string[]} symbol - 要过滤的符号数组
 * @returns {string} - 过滤后的字符串
 */
const filterStringSymbol = (string: string, symbol: string[]) => {
  let newString = string;
  symbol.forEach((s) => {
    // @ts-ignore
    newString = newString.replaceAll(s, '');
  });

  return newString;
};

/**
 * SelectList 基础组件
 * 支持多种数据格式、本地搜索、自定义渲染等功能
 *
 * @param {SelectListProps} props - 组件属性
 * @param {React.Ref} [props.actionRef] - 提供给外部的接口引用
 * @param {object} [props.linkProps] - 下拉框底部链接属性
 * @param {React.ReactNode} [props.alert] - 下拉框底部提示信息
 * @param {string|number} [props.width='100%'] - 组件宽度
 * @param {any} [props.options=[]] - 数据源，支持多种格式
 * @param {string[]} [props.fields] - 字段映射，如 ['key', 'name']
 * @param {any} [props.extraOptions=[]] - 额外的数据源
 * @param {function} [props.optionRender] - 自定义选项渲染函数
 * @param {boolean} [props.localSearch=false] - 是否开启本地搜索
 * @param {string[]} [props.filterSymbol=['_', '/', '-']] - 本地搜索时过滤的符号
 * @param {any} [props.rest] - 其他属性，传递给 antd Select 组件
 * @returns {React.ReactNode} - 渲染的选择列表组件
 */
const SelectList = (props: SelectListProps) => {
  const {
    actionRef,
    linkProps,
    alert,
    width = '100%',
    options = [],
    fields,
    extraOptions = [],
    optionRender,
    localSearch = false,
    filterSymbol = ['_', '/', '-'],
    ...rest
  } = props;

  const { isComposing, ...compositionProps } = useComposing();

  // 提供给外部的接口
  useImperativeHandle(actionRef, () => ({
    isComposing,
  }));

  /**
   * 处理和缓存数据
   * 使用 useMemo 缓存处理后的数据，避免在数据量较大且频繁更新的场景下，每次渲染都进行过滤操作
   *
   * 处理步骤：
   * 1. 格式化原始 options 数据
   * 2. 格式化 extraOptions 数据
   * 3. 合并两者
   * 4. 去重处理
   * 5. 过滤处理
   */
  const newOptions = useMemo(() => {
    // 由于 options 和 extraOptions 可能是多种格式的数据，需要进行统一处理
    const combinedOptions = [
      ..._format.options({ data: options, fields, optionRender }),
      ..._format.options({ data: extraOptions, fields, optionRender }),
    ];

    // 去重处理，使用 Map 确保唯一性
    const uniqueMap = new Map();
    combinedOptions.forEach((item) => {
      const key = item[fields?.[0]] || item.value;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    // 过滤处理，返回最终的选项数组
    return _filter(Array.from(uniqueMap.values()));
  }, [options, extraOptions, fields, optionRender]);

  /**
   * 本地搜索过滤函数
   * 开启本地搜索时，用于筛选本地数据
   *
   * 特性：
   * 1. 默认过滤字符串中的 _ / - 符号
   * 2. 支持带空格的全局模糊匹配
   * 3. 支持拼音输入时的搜索优化
   *
   * @param {string} input - 用户输入的搜索关键词
   * @param {any} option - 当前选项对象
   * @returns {boolean} - 是否匹配
   */
  const filterOption = (input: string, option: any) => {
    // 正在输入复合文本（如拼音）时，不进行过滤
    if (isComposing) return false;

    // 获取选项的值和标签
    const value = option?.[fields?.[0]] || option?.value;
    const label = option?.[fields?.[1]] || option?.label;

    // 处理输入关键词：过滤符号，转为小写，按空格分割
    const inputList = filterStringSymbol(
      input.toLowerCase(),
      filterSymbol,
    ).split(' ');

    // 处理选项文本：过滤符号，转为小写
    const optionLabel = filterStringSymbol(label?.toLowerCase(), filterSymbol);
    const optionValue = filterStringSymbol(value?.toLowerCase(), filterSymbol);

    // 检查输入的每个关键词是否都在选项中出现
    return inputList.every(
      (s) => optionLabel.includes(s) || optionValue.includes(s),
    );
  };

  return (
    <Select
      style={{ width }} // 设置组件宽度
      options={newOptions} // 处理后的选项数据
      showSearch={rest.showSearch ?? localSearch} // 是否显示搜索框
      filterOption={localSearch ? filterOption : false} // 本地搜索过滤函数
      popupRender={(menu) => {
        // 自定义下拉框底部内容
        if (alert || linkProps) {
          return (
            <>
              {menu} {/* 原始菜单内容 */}
              <Divider style={{ margin: '4px 0' }} />
              {linkProps ? (
                // 底部链接
                <div style={{ textAlign: 'center' }}>
                  <LinkBtn {...linkProps}>前往设置</LinkBtn>
                </div>
              ) : (
                // 底部提示信息
                alert
              )}
            </>
          );
        }

        // 默认返回原始菜单
        return menu;
      }}
      {...compositionProps}
      {...rest} // 其他属性传递给 antd Select 组件
    />
  );
};

export default SelectList;
