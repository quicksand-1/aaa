import { Button } from 'antd';
import { useDebounce } from 'fintech';
import { useState } from 'react';

const Demo = () => {
  const [count, setCount] = useState(0);

  return (
    <Button
      onClick={useDebounce(() => {
        setCount(count + 1);
      })}
    >
      计数：{count}
    </Button>
  );
};

export default Demo;
