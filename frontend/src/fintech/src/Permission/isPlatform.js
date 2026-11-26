import storageSQL from '../utils/storageSQL';

export default (code) => {
  const { key } = storageSQL('find', { where: 'sys=env' });

  return !!code.includes(key);
};
