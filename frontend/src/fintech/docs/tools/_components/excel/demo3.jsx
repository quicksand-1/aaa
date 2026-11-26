import { CopyOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Flex, Space, message } from 'antd';
import { Excel2Json, JsonCode, SelectList, clipboard } from 'fintech';
import { useState } from 'react';

export default () => {
  const [data, setData] = useState({});
  const [text, setText] = useState('');

  return (
    <Flex vertical gap={12}>
      <Space wrap>
        <Excel2Json
          onFinish={(res) => {
            setData(res);
          }}
        >
          <Button type="primary" icon={<UploadOutlined />}>
            提交表格
          </Button>
        </Excel2Json>
        <SelectList
          style={{ width: 200 }}
          placeholder="选择 sheet"
          options={Object.keys(data)}
          onChange={(key) => {
            setText(JSON.stringify(data[key]));
          }}
        />
        <Button
          icon={<CopyOutlined />}
          disabled={!text}
          onClick={() => {
            clipboard.copy(text).then(() => {
              message.success('已复制');
            });
          }}
        >
          复制内容
        </Button>
      </Space>
      {text && <JsonCode data={text} />}
    </Flex>
  );
};
