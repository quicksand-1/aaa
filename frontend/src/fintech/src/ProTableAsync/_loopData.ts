/**
 * 递归数据源
 * @params
 *    data: 数据源
 *    expandable: 二级或多级数据栏配置项
 * */
import genNewID from '../utils/genNewID';

export default function _loopData(data = [], rowKey = '', expandable) {
  // 检测原始数据中是否有 rowKey 字段
  if (data[0] && data[0][rowKey]) {
    return data;
  }

  return data.map((item: any) => {
    const newItem = {
      ...item,
      [rowKey]: genNewID(),
    };

    if (expandable) {
      const children = expandable.childrenColumnName || 'children';

      return {
        ...newItem,
        [children]: _loopData(item[children], rowKey, expandable),
      };
    }

    return newItem;
  });
}
