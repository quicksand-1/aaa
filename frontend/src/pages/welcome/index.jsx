import { useState } from 'react';
import { history, useAccess } from '@umijs/max';
import { Button, Card, Tag } from 'antd';
import {
  AppstoreOutlined,
  DatabaseOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import MobileScanModal from '@/components/MobileScanModal';

const START_ITEMS = [
  {
    key: 'page',
    icon: <AppstoreOutlined />,
    title: '新增业务页面',
    description:
      '在 src/pages 下创建页面，并在 config/routes.ts 登记路由和菜单名称。',
    tag: '前端',
  },
  {
    key: 'api',
    icon: <DatabaseOutlined />,
    title: '接入后端接口',
    description:
      '按 controller、service、router 分层添加接口，数据库表通过 migration 管理。',
    tag: '后端',
  },
  {
    key: 'permission',
    icon: <SafetyCertificateOutlined />,
    title: '配置模块权限',
    description:
      '在新业务需要独立权限时，将模块登记到前后端的 PERMISSION_MODULES。',
    tag: '权限',
  },
];

export default function WelcomePage() {
  const [scanOpen, setScanOpen] = useState(false);
  const access = useAccess();

  return (
    <div className="w-full pb-8">
      <div>
        <Tag color="blue">基础框架</Tag>
        <h1 className="mb-0 mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          业务工作台已就绪
        </h1>
        <p className="mb-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          当前仓库只保留登录、账户管理、权限扩展、统一请求、布局和部署能力，可以直接开始开发新的业务模块。
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {START_ITEMS.map((item) => (
          <Card key={item.key} className="h-full" bordered>
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-lg text-blue-600">
                {item.icon}
              </span>
              <Tag>{item.tag}</Tag>
            </div>
            <h2 className="mb-2 mt-5 text-base font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="m-0 text-sm leading-6 text-slate-500">
              {item.description}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button icon={<QrcodeOutlined />} onClick={() => setScanOpen(true)}>
          手机扫码
        </Button>
        <Button onClick={() => history.push('/m/home')}>移动端入口</Button>
        {access.admin ? (
          <Button type="primary" onClick={() => history.push('/admin')}>
            管理账户
          </Button>
        ) : null}
      </div>
      <MobileScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </div>
  );
}
