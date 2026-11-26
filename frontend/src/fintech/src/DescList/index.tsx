/**
 * 减少 Descriptions 的样板代码
 * @params
 *   dataSource：数据源，可以支持多数据源展示，如：{}、[{}, {},...]
 *   defaultValue：当值不存在时，默认展示的文本，如 --
 *   columns：类似 table 的 columns
 *     title：标题
 *     open：是否渲染该字段，支持 boolean 和 () => {}，如果是函数，必须返回布尔值
 *     span：一行中所占格数
 *     dataIndex：字段名，支持嵌套的方式
 *     sourceIndex：依赖的数据源下标，当 dataSource 是 Array 时才生效
 *     render(text, record)：自定义渲染函数
 *     copyable: 复制功能，值必须是字符串
 *     valueType: 值类型
 *     valueEnum: 值枚举
 * */

import type { DescListProps } from '../types';
import Async from './async';
import Base from './base';

const DescList = (props: DescListProps) => {
  const { url, ...rest } = props;

  if (url) {
    return <Async url={url} {...rest} />;
  }

  return <Base {...rest} />;
};

export default DescList;
