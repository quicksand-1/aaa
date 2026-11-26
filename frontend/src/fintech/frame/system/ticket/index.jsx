import { Iframe, MagicTabs, Permission } from 'fintech';
import platformStorage from '../../global/platformStorage';
import List from './List';

export default () => {
  const isAccess = Permission.useAccess();
  const { proxy } = platformStorage.get();

  return (
    <MagicTabs
      noTabBarBottom
      persistenceKey="ticket"
      items={[
        {
          key: 'apply',
          label: '我的申请',
          children: <List type="apply" url="/workOrder/apply.json" />,
          open: isAccess('ticket_apply'),
        },
        {
          key: 'todo',
          label: '我的待办',
          children: <List type="todo" url="/workOrder/my.json" />,
          open: isAccess('ticket_todo'),
        },
        {
          key: 'history',
          label: '历史工单',
          children: <List type="history" url="/workOrder/history.json" />,
          open: isAccess('ticket_history'),
        },
        {
          key: 'workflow',
          label: '工单审批配置',
          children: <Iframe height="85vh" src={`${proxy}/workflow/index`} />,
          open: isAccess('ticket_workflow'),
        },
      ]}
    />
  );
};
