import { history } from '@umijs/max';
import storageSQL from './storageSQL';

const toTools = () => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
      if (location.pathname.includes('/tools')) {
        const { to = '/' } = storageSQL('find', {
          where: 'key=tools',
        });
        location.href = to;
      } else {
        storageSQL('duplicate', {
          where: 'key=tools',
          values: {
            key: 'tools',
            to: location.href,
          },
        });
        history.replace('/tools');
      }
    }
  };
  document.addEventListener('keydown', handleKeyDown);
};

export default toTools;
