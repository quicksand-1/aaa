import { Button, Flex, Form, message, Typography } from 'antd';
import { clipboard, FormSchema, useCrypto } from 'fintech';
import { useState } from 'react';

export default () => {
  const [form] = Form.useForm();
  const [text, setText] = useState('');
  const [_, decode] = useCrypto('sm4');

  return (
    <Flex vertical gap={12}>
      <Flex gap={12} align="center">
        <Button
          onClick={() => {
            form.validateFields().then(({ text, key }) => {
              const decryptData = decode(text, key);
              clipboard.copy(decryptData).then(() => {
                message.success('解密成功，已复制');
                setText(decryptData);
              });
            });
          }}
        >
          解密
        </Button>
      </Flex>
      <Form form={form}>
        <FormSchema
          items={[
            { label: '密钥', name: 'key' },
            {
              label: '文本',
              name: 'text',
              valueType: 'textarea',
              inputProps: { rows: 3 },
            },
          ]}
        />
      </Form>
      <Typography.Paragraph copyable>{text}</Typography.Paragraph>
    </Flex>
  );
};
