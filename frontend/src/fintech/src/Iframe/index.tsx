import { Spin } from 'antd';
import { useState } from 'react';

interface IframeProps {
  style?: React.CSSProperties;
  height?: string;
  src: string;
}

export default ({ style, height = '100vh', ...props }: IframeProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <Spin spinning={loading}>
      <iframe
        style={{
          height,
          width: '100%',
          border: 'none',
          ...style,
        }}
        onLoad={() => {
          setLoading(false);
        }}
        {...props}
      />
    </Spin>
  );
};
