/**
 * 状态点
 * */

import { Badge } from 'antd';

type ValueEnum = {
  [key in string]: {
    text: string;
    status: 'Success' | 'Error' | 'Default' | 'Processing' | 'Warning';
  };
};

type StatusEnum = 'success' | 'processing' | 'error' | 'default' | 'warning';

type StatusBadgeProps = {
  value: string;
  valueEnum: ValueEnum;
};

const StatusMap: Record<
  StatusBadgeProps['valueEnum'][string]['status'],
  StatusEnum
> = {
  Success: 'success',
  Error: 'error',
  Default: 'default',
  Processing: 'processing',
  Warning: 'warning',
};

export default (props: StatusBadgeProps) => {
  const { value, valueEnum, ...rest } = props;

  const { text, status } = valueEnum[value] || {};

  if (status) {
    return <Badge text={text} status={StatusMap[status]} {...rest} />;
  }

  return null;
};
