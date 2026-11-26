import localConfig from '../localConfig';
import storageSQL from '../utils/storageSQL';

const validator = ({ code, initAccess, isAccess, platformKey }) => {
  if (isAccess) {
    const [currentCode, currentPlatform] = code.split('/');

    // 如果 code 中包含平台标识
    if (currentPlatform) {
      if (currentPlatform.includes(platformKey)) {
        return !!initAccess[currentCode];
      }

      return true;
    }

    return !!initAccess[currentCode];
  }

  return true;
};

export default () => {
  const { useAccess } = localConfig.newInstance().access;
  const initAccess = useAccess();
  const { access = true, key } = storageSQL('find', { where: 'sys=env' });

  // 字符串类型判断
  const isAccess = (code, type = 'every') => {
    if (typeof code === 'string') {
      return validator({
        code,
        initAccess,
        isAccess: access,
        platformKey: key,
      });
    }

    if (Array.isArray(code)) {
      return code[type]((item) =>
        validator({
          code: item,
          initAccess,
          isAccess: access,
          platformKey: key,
        }),
      );
    }
  };

  return isAccess;
};
