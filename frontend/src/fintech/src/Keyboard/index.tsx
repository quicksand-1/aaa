import { useEffect } from 'react';
import useKeyboard from '../hooks/useKeyboard';

export default ({
  position = 'O',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback = (_state: boolean) => {},
  ...rest
}) => {
  const open = useKeyboard({ position });

  // 当 open 状态变化时调用 callback
  useEffect(() => {
    if (open !== undefined) {
      callback(open);
    }
  }, [open, callback]);

  // 渲染逻辑：仅当 open 为 true 时渲染 children
  return open ? rest.children : null;
};
