import { Card, Empty, Tag } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { PERMISSION_MODULES } from '@/constants';

const STEPS = ['新增页面', '登记路由', '接入接口', '补充权限'];

export default function MobileModulesPage() {
  return (
    <div className="space-y-5 p-4 pb-6">
      <div>
        <h2 className="m-0 text-xl font-semibold text-slate-900">业务模块</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-slate-500">
          这里是移动端业务入口。模块接入后，可按权限展示在页面中，并同步加入底部导航。
        </p>
      </div>

      {PERMISSION_MODULES.length > 0 ? (
        <div className="space-y-3">
          {PERMISSION_MODULES.map((module) => (
            <Card key={module.key} className="rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-lg text-blue-600">
                  <AppstoreOutlined />
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">
                    {module.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {module.key}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl" styles={{ body: { padding: 24 } }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-sm text-slate-400">
                当前还没有接入业务模块
              </span>
            }
          />
        </Card>
      )}

      <section>
        <h3 className="mb-3 mt-0 text-sm font-semibold text-slate-900">
          模块接入步骤
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <Tag color="blue">{index + 1}</Tag>
              <div className="mt-2 text-sm font-medium text-slate-700">
                {step}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
