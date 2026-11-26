import { Flex, Spin } from 'antd';
import { genNewID, GlobalScheduler, LinkBtn, request } from 'fintech';
import { useEffect, useState } from 'react';

const Demo = () => {
  const [name, setName] = useState('');

  const add = () => {
    const id = genNewID(); // 生成唯一编码
    GlobalScheduler.add({
      id,
      start: false,
      queueName: 'demo2',
      // 另外的写法
      action: () => {
        return new Promise((resolve) => {
          request('/globalScheduler/demo2.json')
            .then((res) => {
              setName(res);
            })
            .finally(() => {
              resolve();
            });
        });
      },
    });
  };

  useEffect(() => {
    add();
  }, []);

  return <div>Email：{name}</div>;
};

export default () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 订阅队列状态事件
    GlobalScheduler.listen('demo2', (status) => {
      if (status === 'end') {
        setLoading(false);
        console.log('任务结束');
      }
    });
  }, []);

  return (
    <Spin spinning={loading}>
      <Flex gap={40}>
        <div>
          <LinkBtn
            onClick={() => {
              setLoading(true);
              GlobalScheduler.start('demo2');
            }}
          >
            手动开始
          </LinkBtn>
          {new Array(9).fill(0).map((_, index) => (
            <Demo key={index} />
          ))}
        </div>
      </Flex>
    </Spin>
  );
};
