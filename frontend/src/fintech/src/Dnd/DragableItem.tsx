/**
 * 拖拽排序的子组件，还需要父组件来定义上下文（DndProvider）
 * @params
 *   type: 拖拽类型，不同的拖拽组件需要进行区别
 *   originNode: 需要渲染的子元素
 *   index: 当前子元素的下标位置
 *   value: 当前组件的数据源
 *   setValue: 改变当前数据源的方法
 * */

import update from 'immutability-helper';
import { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

type PROPS_TYPE = {
  originNode: React.ReactNode;
  index: number;
  type: string;
  value: Record<any, any>[];
  setValue: (i: Record<any, any>[]) => void;
};

export default (props: PROPS_TYPE) => {
  const { originNode, index = 0, type, value, setValue } = props;

  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRow = value[dragIndex];
      setValue(
        update(value, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        }),
      );
    },
    [value, setValue],
  );

  const ref = useRef();
  const [, drop] = useDrop({
    accept: type,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [, drag] = useDrag({
    type,
    item: { type, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <span ref={ref} style={{ cursor: 'move' }}>
      {originNode}
    </span>
  );
};
