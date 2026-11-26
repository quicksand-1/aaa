import {
  CopyOutlined,
  FileSearchOutlined,
  LeftOutlined,
  QrcodeOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Flex, QRCode, Typography, message } from 'antd';
import { Form, FormSchema, LinkBtn, clipboard, useCrypto } from 'fintech';
import { useState } from 'react';

export default () => {
  const [form] = Form.useForm();
  const [qrcodeList, setQrcodeList] = useState([]);
  const [jsonString, setJsonString] = useState('');
  const [encode, decode] = useCrypto('sm4');
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <>
      <Form
        form={form}
        onFinish={({ mode, ...v }) => {
          // 生成二维码
          if (mode === 'encode') {
            let index = 0;
            let bytes = 0;
            const stringList = [];
            const string =
              v.compress === 'true' ? encode(v.content) : v.content;
            Array.from(string).forEach((char) => {
              // 编码内容
              const encodedBytes = encodeURIComponent(char);
              const byteCount = encodedBytes.length * 8;

              // 当字节长度小于 40000 时，把当前遍历内容添加到字符串中
              if (byteCount + bytes < 20000) {
                stringList[index] = `${stringList[index] || ''}${char}`;
                bytes += byteCount;
              } else {
                index++;
                bytes = byteCount;
                stringList[index] = char;
              }
            });
            setQrcodeList(stringList);
            setCurrentIndex(0);
            return;
          }

          // 解析二维码信息
          try {
            const decodeTextarea =
              v.compress === 'true' ? decode(v.content) : v.content;

            try {
              const json = JSON.parse(decodeTextarea);
              const str = JSON.stringify(json, null, 2);
              setJsonString(str);
              // setIsJson(true);
            } catch (e) {
              setJsonString(decodeTextarea);
              // setIsJson(false);
            }
          } catch (e) {
            setJsonString(v.content);
            // setIsJson(false);
          }
        }}
      >
        <FormSchema
          gutter={12}
          colSpan={12}
          items={[
            {
              name: 'mode',
              valueType: 'select',
              valueEnum: { encode: '生成二维码', decode: '解析二维码信息' },
              initialValue: 'encode',
            },
            ({ mode }) =>
              mode === 'encode' && {
                name: 'size',
                valueType: 'number',
                initialValue: 400,
                placeholder: '请输入二维码尺寸',
                inputProps: { prefix: '尺寸：' },
              },
            ({ mode }) => {
              if (mode === 'encode') {
                return {
                  name: 'compress',
                  valueType: 'select',
                  valueEnum: { true: '加密信息', false: '不加密信息' },
                  initialValue: 'false',
                };
              }
              return {
                name: 'compress',
                valueType: 'select',
                valueEnum: { true: '信息已加密', false: '信息未加密' },
                initialValue: 'false',
              };
            },
            {
              name: 'content',
              placeholder: '请输入内容',
              valueType: 'textarea',
              colSpan: 24,
              inputProps: { rows: 4 },
            },
            ({ mode }) => (
              <Button
                key="submit"
                type="primary"
                htmlType="submit"
                block
                icon={
                  mode === 'encode' ? (
                    <QrcodeOutlined />
                  ) : (
                    <FileSearchOutlined />
                  )
                }
              >
                {mode === 'encode' ? '生成二维码' : '解析信息'}
              </Button>
            ),
            ({ mode, size }) =>
              mode === 'encode' &&
              qrcodeList.length > 0 && (
                <Flex
                  vertical
                  gap={12}
                  key="qrcode"
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid rgba(5, 5, 5, 0.06)',
                  }}
                >
                  <Flex justify="center" align="center">
                    <QRCode
                      value={qrcodeList[currentIndex]}
                      key={currentIndex}
                      size={+size}
                      errorLevel="L"
                    />
                  </Flex>
                  <Flex justify="center" align="center" gap={12}>
                    <Button
                      icon={<LeftOutlined />}
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                    >
                      上一张
                    </Button>
                    <Typography.Text type="secondary">
                      {currentIndex + 1} / {qrcodeList.length}
                    </Typography.Text>
                    <Button
                      disabled={currentIndex === qrcodeList.length - 1}
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                    >
                      下一张
                      <RightOutlined />
                    </Button>
                  </Flex>
                </Flex>
              ),
            ({ mode }) =>
              mode === 'decode' && (
                <Flex
                  vertical
                  key="content"
                  gap={4}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid rgba(5, 5, 5, 0.06)',
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Typography.Text type="secondary">解析结果</Typography.Text>
                    <LinkBtn
                      icon={<CopyOutlined />}
                      onClick={() => {
                        clipboard.copy(jsonString).then(() => {
                          message.success('复制成功');
                        });
                      }}
                    >
                      复制
                    </LinkBtn>
                  </Flex>
                  <pre style={{ margin: 0, overflow: 'auto' }}>
                    {jsonString}
                  </pre>
                </Flex>
              ),
          ]}
        />
      </Form>
    </>
  );
};
