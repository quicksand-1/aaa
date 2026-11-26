import { Button, Flex, Form, message, Switch, Typography } from 'antd';
import { clipboard, FormSchema, useCrypto } from 'fintech';
import { useState } from 'react';

export default () => {
  const [form] = Form.useForm();
  const [text, setText] = useState('');
  const [encode, _, sm2] = useCrypto('sm2');

  return (
    <Flex vertical gap={12}>
      <Flex gap={12} align="center">
        <Button
          type="primary"
          onClick={() => {
            const { publicKey, privateKey } = sm2.generateKeyPairHex();
            const compressedPublicKey = sm2.compressPublicKeyHex(publicKey);
            let is = sm2.comparePublicKeyHex(publicKey, compressedPublicKey); // 判断公钥是否等价
            console.log(`公钥等价：${is}`);
            is = sm2.verifyPublicKey(publicKey);
            console.log(`验证公钥：${is}`);
            is = sm2.verifyPublicKey(compressedPublicKey);
            console.log(`验证压缩公钥：${is}`);
            setText(
              `公钥：${publicKey}；压缩公钥：${compressedPublicKey}；私钥：${privateKey}`,
            );
          }}
        >
          生成公/私钥
        </Button>
        <Button
          onClick={() => {
            form.validateFields().then(({ text, key, compress }) => {
              const encryptData = encode(text, key, compress);
              clipboard.copy(encryptData).then(() => {
                message.success('加密成功，已复制');
                setText(encryptData);
              });
            });
          }}
        >
          加密
        </Button>
        <Switch
          checkedChildren="公钥压缩"
          unCheckedChildren="公钥不压缩"
          onChange={(v) => {
            form.setFieldsValue({ compress: v });
          }}
        />
      </Flex>
      <Form form={form}>
        <FormSchema
          items={[
            { label: '公钥', name: 'key' },
            {
              label: '公钥压缩',
              name: 'compress',
              hidden: true,
              required: false,
            },
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
