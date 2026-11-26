import { history, useAccess, useModel } from '@umijs/max';
import { Card, Empty, Tag } from 'antd';
import {
  AppstoreOutlined,
  LockOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';

const QUICK_ACTIONS = [
  {
    key: 'modules',
    label: '业务模块',
    description: '查看当前已接入模块',
    icon: <AppstoreOutlined />,
    path: '/m/modules',
  },
  {
    key: 'profile',
    label: '个人中心',
    description: '账号与安全设置',
    icon: <UserOutlined />,
    path: '/m/profile',
  },
  {
    key: 'password',
    label: '修改密码',
    description: '更新当前登录密码',
    icon: <LockOutlined />,
    path: '/m/profile/password',
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

export default function MobileHomePage() {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;

  return (
    <div className="space-y-5 p-4 pb-6">
      <section className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#001529_0%,#0958d9_100%)] p-5 text-white shadow-lg shadow-blue-900/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="m-0 text-xs text-blue-100">
              {greeting()}
              {user?.name ? `，${user.name}` : ''}
            </p>
            <h2 className="mb-0 mt-2 text-xl font-semibold">
              欢迎使用一屏宏观
            </h2>
          </div>
          {access.admin ? (
            <Tag className="m-0 border-0 bg-white/15 text-white">管理员</Tag>
          ) : null}
        </div>
        <p className="mb-0 mt-4 text-sm leading-6 text-blue-50/80">
          移动端框架已经就绪，后续业务页面会自动复用登录、权限和请求能力。
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-base font-semibold text-slate-900">
            快捷入口
          </h2>
          <span className="text-xs text-slate-400">常用功能</span>
        </div>
        <div className="space-y-2">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.key}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left active:bg-slate-50"
              type="button"
              onClick={() => history.push(item.path)}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-lg text-blue-600">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {item.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">
                  {item.description}
                </span>
              </span>
              <RightOutlined className="text-xs text-slate-300" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-base font-semibold text-slate-900">
            业务概览
          </h2>
          <span className="text-xs text-slate-400">实时数据</span>
        </div>
        <Card className="rounded-2xl" styles={{ body: { padding: 20 } }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-sm text-slate-400">
                暂无业务数据，接入模块后将在这里展示
              </span>
            }
          />
        </Card>
      </section>
    </div>
  );
}
