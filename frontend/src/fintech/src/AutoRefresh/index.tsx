import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import storageSQL from '../utils/storageSQL';

export default ({
  callback = () => {},
  interval = 10,
  persistenceKey = location.pathname,
}: any) => {
  const storageProps = {
    from: 'refresh',
    where: `key=${persistenceKey}`,
  };

  const timerRef = useRef(null);
  // 是否开始自动执行任务
  const [open, setOpen] = useState(() => {
    if (persistenceKey) {
      const { open } = storageSQL('find', storageProps);
      return !!open;
    }
    return false;
  });
  const [second, setSecond] = useState(interval);

  // 执行任务
  useEffect(() => {
    // 开始自动刷新
    if (open) {
      let num = interval;
      timerRef.current = setInterval(() => {
        num--;
        // 如果 = 0，则触发回调函数
        if (num < 1) {
          num = interval;
          callback();
          setSecond(interval);
        } else {
          setSecond(num);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setSecond(interval);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [open]);

  return (
    <Button
      color="cyan"
      variant="solid"
      onClick={() => {
        setOpen(!open);
        if (persistenceKey) {
          storageSQL('duplicate', {
            ...storageProps,
            values: { key: persistenceKey, open: !open },
          });
        }
      }}
    >
      {open ? `${second}s ` : ''}自动刷新
    </Button>
  );
};
