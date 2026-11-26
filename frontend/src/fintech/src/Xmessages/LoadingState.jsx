import { Spin } from 'antd';
import useStyles from './style';

export default function LoadingState() {
  const { styles } = useStyles();

  return (
    <div className={styles.state}>
      <Spin spinning description="加载中..." />
    </div>
  );
}
