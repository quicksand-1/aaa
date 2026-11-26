/**
 * 拖拽的父组件，用来定义上下文
 * */
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragableItem from './DragableItem';

export default ({
  data = [],
  rowKey,
  originNode = () => {},
  ...props
}: any) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {data.map((i, index) => (
        <DragableItem
          {...props}
          value={data}
          index={index}
          key={i[rowKey]}
          originNode={originNode(i, index)}
        />
      ))}
    </DndProvider>
  );
};
