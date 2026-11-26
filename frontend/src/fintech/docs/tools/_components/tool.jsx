import { BgColorsOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, message } from 'antd';
import React from 'react';
import runMedia from './runMedia';

export default () => {
  const [color, setColor] = React.useState('');

  return (
    <Flex align="center" gap={12} wrap>
      <Button
        icon={<VideoCameraOutlined />}
        onClick={async () => await runMedia({ filename: 'video' })}
      >
        录屏
      </Button>
      <Button
        icon={<BgColorsOutlined />}
        onClick={async () => {
          /**
           * 查看当前网络上下文是否安全，可执行条件：
           * https://
           * http://localhost
           * http://127.0.0.1
           * 浏览器扩展（chrome-extension://）
           * 文件协议（file://）
           * */
          if (window.isSecureContext) {
            try {
              const dropper = new EyeDropper();
              const result = await dropper.open();
              setColor(result.sRGBHex);
            } catch (e) {
              message.warning('浏览器不支持，请升级浏览器版本');
            }
          }
        }}
      >
        取色
      </Button>
      {color ? (
        <Flex align="center" gap={8}>
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: color,
            }}
          />
          <Typography.Text copyable>{color}</Typography.Text>
        </Flex>
      ) : (
        <Typography.Text type="secondary">
          点击“取色”从屏幕拾取颜色
        </Typography.Text>
      )}
    </Flex>
  );
};
