/**
 * 欢迎页
 * */

import { Typography } from 'antd';
import { useDate } from 'fintech';

const { Title } = Typography;

const Welcome = () => {
  const { YYYY, MM, DD, hh, mm, ss, week } = useDate();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>欢迎！</Title>
      <Title level={4}>{week}</Title>
      <Title level={4}>
        {YYYY}年 {MM}月 {DD}日 {hh}:{mm}:{ss}
      </Title>
    </div>
  );
};

export default Welcome;
