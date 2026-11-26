/**
 * 获取 object 路径下对应的值，类似 Table 组件的 dataIndex
 * url：https://4x-ant-design.antgroup.com/components/table-cn/#Column
 * */
import type { DataIndexPath } from '../types';

function _deepGet(object: Record<string, any>, path: DataIndexPath = '') {
  return (
    !Array.isArray(path)
      ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.')
      : path
  ).reduce((o, k) => (o || {})[k], object);
}

export default _deepGet;
