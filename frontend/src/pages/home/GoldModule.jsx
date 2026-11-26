import { Flex, Skeleton } from 'antd';
import { GoldOutlined } from '@ant-design/icons';
import MarketModuleCard, { SnapshotItem } from './MarketModuleCard';

export default ({ marketData = [] }) => {
  const snapshots = marketData.filter((item) => item.category === '黄金');

  return (
    <MarketModuleCard
      title="黄金"
      subtitle="现货 · XAU / USD · XAU / CNY"
      accent="gold"
      icon={<GoldOutlined className="text-lg" />}
    >
      <Flex gap={24} wrap>
        {snapshots.length ? (
          snapshots.map((item) => (
            <SnapshotItem key={item.label} {...item} diffOnLabel />
          ))
        ) : (
          <Skeleton active paragraph={{ rows: 1 }} />
        )}
      </Flex>
    </MarketModuleCard>
  );
};
