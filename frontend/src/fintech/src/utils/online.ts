import { Modal } from 'antd';

let modal;

const online = () => {
  window.addEventListener('offline', () => {
    modal = Modal.warning({
      title: '网络已断开',
    });
  });
  window.addEventListener('online', () => {
    if (modal) {
      modal.destroy();
    }
    modal = null;
  });
};

export default online;
