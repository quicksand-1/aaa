/**
 * 计算源数据中需要合并的 rowspan
 * 支持嵌套的 dataIndex
 * 比如数据: [
 *   { type: 1, name: a },
 *   { type: 1, name: b },
 *   { type: 2, name: b },
 *   { type: 1, name: a },
 *   { type: 1, name: c },
 * ]
 * 返回: {
 *   type: [2,0,1,2,0],
 *   name: [1,2,0,1,1],
 * }
 * */
import _deepGet from '../utils/_deepGet';

const _mergeRowspanResults = (dataSource = [], mergeDataIndex = []) => {
  const rowsSpan: any = {};

  mergeDataIndex.forEach((key) => {
    const stringKey = Array.isArray(key) ? key.join('.') : key;

    let prevType: string | null = null; // 前一个值
    let index2 = 0; // 需要进行叠加值的下标
    const result: number[] = new Array(dataSource.length).fill(0);

    dataSource.forEach((item: any, idx) => {
      if (_deepGet(item, stringKey) !== prevType) {
        index2 = idx;
      }
      result[index2] = result[index2] + 1;
      prevType = _deepGet(item, stringKey);
    });

    rowsSpan[stringKey] = result;
  });

  return rowsSpan;
};

export default _mergeRowspanResults;
