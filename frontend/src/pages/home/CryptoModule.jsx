import { Flex, Skeleton } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import MarketModuleCard, { SnapshotItem } from './MarketModuleCard';

export default ({ marketData = [] }) => {
  const snapshots = marketData.filter((item) => item.category === '加密货币');

  return (
    <MarketModuleCard
      title="加密资产"
      subtitle="主流币种 · 24 小时涨跌"
      accent="violet"
      icon={<DollarCircleOutlined className="text-lg" />}
    >
      <Flex gap={20} wrap>
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
