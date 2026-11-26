/**
 * 递归遍历 columns，筛选出符合要求的 column
 * 1、从 _columnsStorage 缓存中获取用户自定义设置的字段显示/隐藏
 * 2、过滤掉 hideInTable 为 true 的 column
 * 3、过滤掉 valueType 为 option 的 column
 * 4、过滤掉 dataIndex 为空 && renderText 为空 的 column
 * */
import _columnsStorage from './_columnsStorage';

export default function _flattenColumns({
  columns = [],
  parentTitle = '',
  persistenceKey = '',
}) {
  let flattenedColumns: any[] = [];
  const columnsState = _columnsStorage(persistenceKey);

  columns.forEach((column: any) => {
    // 处理子列
    if (column.children?.length > 0) {
      // 递归调用flattenColumns处理子列
      const children = _flattenColumns({
        persistenceKey,
        columns: column.children,
        parentTitle: column.title,
      });
      // 将子列展开后的结果与父列合并
      flattenedColumns = [...flattenedColumns, ...children];
    } else {
      /**
       * 如下条件不参与导出
       * 如：列表不展示、操作列、字段不存在或没有渲染函数
       * */
      if (
        column.hideInTable ||
        column.valueType === 'option' ||
        (!column.dataIndex && !column.renderText)
      )
        return;

      // 子列数据
      const modifiedColumn = {
        ...column,
        // 将标题改为父标题+标题的形式
        title: parentTitle ? `${parentTitle} - ${column.title}` : column.title,
      };

      // 当持久化数据中字段不存在，或字段值为 true 时
      if (columnsState[column.dataIndex]?.show === false) {
        return;
      } else {
        flattenedColumns.push(modifiedColumn);
      }
    }
  });
  return flattenedColumns;
}
