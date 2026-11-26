import storageSQL from '../utils/storageSQL';

export default (code) => {
  const { app } = storageSQL('find', { where: 'sys=env' });

  return !!code.includes(app?.key);
};
