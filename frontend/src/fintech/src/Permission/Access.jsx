import { Result } from 'antd';
import localConfig from '../localConfig';
import useAccess from './useAccess';

const Fallback = <Result status="warning" title="暂无权限" />;

export default ({
  code = '',
  type = 'every',
  showFallback = false,
  ...rest
}) => {
  const { Access } = localConfig.newInstance().access;
  const isAccess = useAccess();

  return (
    <Access
      accessible={isAccess(code, type)}
      fallback={showFallback && Fallback}
      {...rest}
    />
  );
};
