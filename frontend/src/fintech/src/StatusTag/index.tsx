/**
 * 状态标签
 * */

import { Tag } from 'antd';

type ValueEnum = {
  [key in string]: {
    text: string;
    status: 'Success' | 'Error' | 'Default' | 'Processing' | 'Warning';
  };
};

type StatusEnum = 'success' | 'processing' | 'error' | 'default' | 'warning';

type StatusTagProps = {
  value: string;
  valueEnum: ValueEnum;
};

const StatusMap: Record<
  StatusTagProps['valueEnum'][string]['status'],
  StatusEnum
> = {
  Success: 'success',
  Error: 'error',
  Default: 'default',
  Processing: 'processing',
  Warning: 'warning',
};

export default (props: StatusTagProps) => {
  const { value, valueEnum } = props;

  const { text, status, ...rest } = valueEnum[value] || {};

  return (
    <Tag color={StatusMap[status]} {...rest}>
      {text}
    </Tag>
  );
};
