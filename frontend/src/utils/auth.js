import { Modal } from 'antd';
import { request } from 'fintech';

export function logout() {
  return request('/logout.json', { method: 'GET' }).then(() => {
    // 退出后回到公开首页；整页跳转保证 initialState 里的登录态被重新拉取
    window.location.replace('/info');
  });
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
