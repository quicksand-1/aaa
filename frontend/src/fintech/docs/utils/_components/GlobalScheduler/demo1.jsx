import { Flex } from 'antd';
import { genNewID, GlobalScheduler, request } from 'fintech';
import { useEffect, useState } from 'react';

const Demo = () => {
  const [name, setName] = useState('');

  useEffect(() => {
    const id = genNewID(); // 生成唯一编码
    const cancel = GlobalScheduler.add({
      id,
      queueName: 'demo1',
      action: () =>
        request('/globalScheduler/demo.json').then((res) => {
          setName(res);
        }),
    });

    // 订阅队列状态事件
    GlobalScheduler.listen('demo1', (status) => {
      if (status === 'end') {
        console.log('任务结束');
      }
    });

    // 组件卸载后取消任务
    return () => {
      cancel();
    };
  }, []);

  return <div>姓名：{name}</div>;
};

export default () => {
  return (
    <Flex gap={40}>
      <div>
        {new Array(10).fill(0).map(() => (
          <Demo key={Math.random()} />
        ))}
      </div>
    </Flex>
  );
};
