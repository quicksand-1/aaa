import { Card, Tabs } from 'antd';
import ResetPassword from './ResetPassword';

const Account = () => {
  return (
    <Card>
      <Tabs
        items={[
          {
            key: 'password',
            label: '修改密码',
            children: <ResetPassword />,
          },
        ]}
      />
    </Card>
  );
};

export default Account;
