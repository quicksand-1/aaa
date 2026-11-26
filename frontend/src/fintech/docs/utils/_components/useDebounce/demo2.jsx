import { Flex, Input } from 'antd';
import { useDebounce } from 'fintech';
import { useEffect, useState } from 'react';

const Demo = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const fn = useDebounce(() => {
    setResult(text);
  }, 600);

  useEffect(() => {
    fn();
  }, [text]);

  return (
    <Flex vertical gap={12}>
      <Input
        value={text}
        placeholder="请输入"
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <div>{result}</div>
    </Flex>
  );
};

export default Demo;
