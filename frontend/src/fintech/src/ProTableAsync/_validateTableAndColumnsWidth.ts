/**
 * 比较 table 的宽度 和 columns 的宽度
 * */
import calculateCharacterLength from '../utils/calculateCharacterLength';
import _columnsStorage from './_columnsStorage';

const _validateTableAndColumnsWidth = ({ id, columns, persistenceKey }) => {
  const tableWidth = document.getElementById(id)?.offsetWidth;
  let columnsWidth = 0;

  columns.forEach((i) => {
    // 列不展示时
    if (i.hideInTable) {
      return;
    }

    // 列在缓存中隐藏时
    const columnsState = _columnsStorage(persistenceKey);
    if (columnsState[i.dataIndex]?.show === false) {
      return;
    }

    // 列有自定义宽度
    if (i.width) {
      columnsWidth += i.width;
      return;
    }

    // 列有子元素时，父元素长度为子元素长度之和
    if (i.children) {
      columnsWidth += _validateTableAndColumnsWidth({
        id,
        columns: i.children,
        persistenceKey,
      }).columnsWidth;
      return;
    }

    // 动态计算宽度
    let itemWidth = calculateCharacterLength(i) + 44;
    if (i.tooltip) {
      itemWidth += 20;
    }

    i.calcwidth = itemWidth;
    columnsWidth += itemWidth;
  });

  // 是否要自动计算列的宽度
  const autoScrollX = tableWidth < columnsWidth;

  return {
    autoScrollX,
    columnsWidth,
    width: autoScrollX ? columnsWidth : undefined,
  };
};

export default _validateTableAndColumnsWidth;
