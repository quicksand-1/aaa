import { MagicTabs, Permission } from 'fintech';
import React from 'react';
import AdminSecretPage from './admin';
import PersonalSecretPage from './personal';

/** 秘钥管理统一入口：按页签隔离本人管理与管理员全局代管。 */
export default function SecretPage() {
  const access = Permission.useAccess();

  return (
    <MagicTabs
      ghost
      persistenceKey={false}
      items={[
        {
          children: <PersonalSecretPage />,
          key: 'personal',
          label: '我的',
          open: access('apitoken_mgr'),
        },
        {
          children: <AdminSecretPage />,
          key: 'admin',
          label: '全局管理',
          open: access('apitoken_admin_mgr'),
        },
      ]}
    />
  );
}
