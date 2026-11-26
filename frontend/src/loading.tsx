import { Spin } from 'antd';

export default () => {
  return (
    <Spin spinning description="信息初始化中...">
      <div style={{ width: '100vw', height: '100vh' }} />
    </Spin>
  );
};
