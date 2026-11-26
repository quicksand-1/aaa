import { Empty } from 'antd';
import useStyles from './style';

export default function EmptyState() {
  const { styles } = useStyles();

  return (
    <div className={styles.state}>
      <Empty description="暂无消息" />
    </div>
  );
}
