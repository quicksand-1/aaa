/**
 * 侧栏底部操作区
 * 1、后台管理入口
 * 2、用户菜单：头像、用户名、个人设置、退出登录
 * */
import { useState } from 'react';
import { history, useAccess, useLocation, useModel } from '@umijs/max';
import { Dropdown } from 'antd';
import {
  LogoutOutlined,
  QrcodeOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { confirmLogout } from '@/utils/auth';
import MobileScanModal from '@/components/MobileScanModal';

const AdminMenuItem = ({ collapsed }) => {
  const access = useAccess();
  const location = useLocation();

  if (!access.admin) return null;

  const active = location.pathname.startsWith('/admin');

  return (
    <div className="px-2 pb-2 pt-2">
      <button
        className={`group flex w-full cursor-pointer items-center rounded-md text-[13px] transition-colors duration-200 ${
          collapsed ? 'justify-center px-0 py-2' : 'gap-2 px-2 py-2'
        } ${
          active
            ? 'bg-[#1677ff] text-white'
            : 'text-[#d9e6f2] hover:bg-[#ffffff14] hover:text-white'
        }`}
        type="button"
        onClick={() => history.push('/admin')}
      >
        <SettingOutlined className="w-5 text-center text-[14px]" />
        {!collapsed && <span>后台管理</span>}
      </button>
    </div>
  );
};

const RightContent = ({ collapsed = false }) => {
  const [scanOpen, setScanOpen] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  return (
    <>
      <AdminMenuItem collapsed={collapsed} />
      <div className="border-t border-white/10" />
      <Dropdown
        menu={{
          items: [
            {
              key: 'scan',
              label: '手机扫码',
              icon: <QrcodeOutlined />,
            },
            {
              key: 'settings',
              label: '个人设置',
              icon: <SettingOutlined />,
            },
            { type: 'divider' },
            {
              key: 'logout',
              label: '退出登录',
              danger: true,
              icon: <LogoutOutlined />,
            },
          ],
          onClick: ({ key }) => {
            if (key === 'scan') {
              setScanOpen(true);
            } else if (key === 'logout') {
              confirmLogout().then((confirmed) => {
                if (!confirmed) return;
                setInitialState((previous) => ({
                  ...previous,
                  currentUser: undefined,
                }));
              });
            } else {
              history.push(`/${key}`);
            }
          },
        }}
      >
        <div
          className={`group flex cursor-pointer select-none items-center rounded-md text-[#d9e6f2] transition-colors duration-200 ${
            collapsed ? 'w-full justify-center px-0 py-2' : 'gap-2 px-2 py-2'
          } hover:bg-[#ffffff14]`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6f4ff] text-[15px] text-[#1677ff] transition-colors duration-200 group-hover:bg-[#bae0ff]">
            <UserOutlined />
          </div>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-[13px] leading-5">
              {initialState?.currentUser?.account}
            </span>
          )}
        </div>
      </Dropdown>
      <MobileScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </>
  );
};

export default RightContent;
