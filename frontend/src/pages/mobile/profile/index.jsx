import { history, useModel } from '@umijs/max';
import { Card, Tag } from 'antd';
import {
  LockOutlined,
  LogoutOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { confirmLogout } from '@/utils/auth';

export default function MobileProfilePage() {
  const { initialState, setInitialState } = useModel('@@initialState');
  const user = initialState?.currentUser;

  const actions = [
    {
      key: 'password',
      label: '修改密码',
      description: '更新当前登录密码',
      icon: <LockOutlined />,
      path: '/m/profile/password',
    },
  ];

  const handleLogout = () => {
    confirmLogout().then((confirmed) => {
      if (!confirmed) return;
      setInitialState((previous) => ({
        ...previous,
        currentUser: undefined,
      }));
    });
  };

  return (
    <div className="space-y-5 p-4 pb-6">
      <Card className="rounded-2xl" styles={{ body: { padding: 20 } }}>
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-xl font-semibold text-blue-600">
            {user?.name?.slice(0, 1) || user?.account?.slice(0, 1) || (
              <UserOutlined />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="m-0 truncate text-lg font-semibold text-slate-900">
                {user?.name || '当前用户'}
              </h2>
              {user?.isAdmin ? <Tag color="blue">管理员</Tag> : null}
            </div>
            <p className="mb-0 mt-1 truncate text-sm text-slate-400">
              {user?.account || '-'}
            </p>
            <p className="mb-0 mt-1 text-xs text-slate-400">
              角色：{user?.role || '-'}
            </p>
          </div>
        </div>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {actions.map((item) => (
          <button
            key={item.key}
            className="flex w-full items-center gap-3 border-0 border-b border-slate-100 bg-white px-4 py-4 text-left last:border-b-0 active:bg-slate-50"
            type="button"
            onClick={() => history.push(item.path)}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-600">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-800">
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {item.description}
              </span>
            </span>
            <RightOutlined className="text-xs text-slate-300" />
          </button>
        ))}
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-4 text-sm font-medium text-red-500 active:bg-red-50"
        type="button"
        onClick={handleLogout}
      >
        <LogoutOutlined />
        退出登录
      </button>
    </div>
  );
}
