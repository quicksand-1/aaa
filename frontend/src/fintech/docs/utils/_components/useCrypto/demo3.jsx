import { Button, Flex, Form, message, Typography } from 'antd';
import { clipboard, FormSchema, useCrypto } from 'fintech';
import { useState } from 'react';

export default () => {
  const [form] = Form.useForm();
  const [text, setText] = useState('');
  const [encode] = useCrypto('sm4');

  return (
    <Flex vertical gap={12}>
      <Flex gap={12} align="center">
        <Button
          type="primary"
          onClick={() => {
            async function generateRandomSm4Key() {
              // 生成128位（16字节）随机密钥
              const keyBuffer = await crypto.subtle.generateKey(
                { name: 'AES-CBC', length: 128 }, // SM4 兼容 AES-128 长度
                true, // 是否可导出
                ['encrypt', 'decrypt'],
              );
              // 转换为 Hex 字符串
              const rawKey = await crypto.subtle.exportKey('raw', keyBuffer);
              const keyBytes = new Uint8Array(rawKey);
              let hexKey = '';
              keyBytes.forEach((byte) => {
                hexKey += byte.toString(16).padStart(2, '0');
              });
              return hexKey;
            }

            generateRandomSm4Key().then((key) => {
              setText(`sm4秘钥：${key}`);
            });
          }}
        >
          生成密钥
        </Button>
        <Button
          onClick={() => {
            form.validateFields().then(({ text, key }) => {
              const encryptData = encode(text, key);
              clipboard.copy(encryptData).then(() => {
                message.success('加密成功，已复制');
                setText(encryptData);
              });
            });
          }}
        >
          加密
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
      {/*<Divider titlePlacement="start" />
      <Form form={form2}>
        <FormSchema
          items={[
            { label: '密钥', name: 'key' },
            { label: '密文', name: 'text', valueType: 'textarea', inputProps: { rows: 3 } },
          ]}
        />
        <Button
          onClick={() => {
            form2.validateFields().then(({ text, key }) => {
              const encryptData = sm4.decrypt(text, key);
              clipboard.copy(encryptData).then(() => {
                message.success('解密成功，已复制');
              })
            });
          }}
        >解密</Button>
      </Form>*/}
    </Flex>
  );
};
