/**
 * 键盘事件
 * */

import { useEffect, useState } from 'react';

type KeyboardProps = {
  position?: string; // 默认值为 'O'
  callback?: (open?: boolean) => void;
};

const useKeyboardToggle = (props: KeyboardProps) => {
  const { position = 'O', callback = () => {} } = props || {};

  const [open, setOpen] = useState(undefined);

  // 定义事件处理函数
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === position) {
      setOpen((prevOpen) => {
        callback(!prevOpen);
        return !prevOpen;
      }); // 使用函数式更新确保状态正确
    }
  };

  useEffect(() => {
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown);

    // 清理函数：移除事件监听器
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position]); // 只有当 position 改变时重新绑定事件

  return open;
};

export default useKeyboardToggle;
