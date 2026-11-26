import { Modal } from 'antd';
import { request } from 'fintech';
import redirect from 'frame/global/redirect';

export function logout() {
  redirect.noLogin();
  return request('/logout.json', { method: 'GET' });
}

export function confirmLogout() {
  return new Promise((resolve) => {
    Modal.confirm({
      centered: true,
      title: '确认退出登录？',
      content: '退出后需要重新登录才能继续使用一屏宏观。',
      okText: '退出登录',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await logout();
        resolve(true);
      },
      onCancel: () => resolve(false),
    });
  });
}
