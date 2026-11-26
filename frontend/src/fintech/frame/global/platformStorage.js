/**
 * 框架中渲染平台的缓存操作逻辑
 * */

import configPlatform from '../../../../config/platform';
import storageSQL from '../../src/utils/storageSQL';

const platformStorage = {
  init() {
    // 获取本地缓存信息
    const cache = this.get();
    // 获取当前平台信息，如果缓存中没有，则直接使用第一个平台信息
    const {
      apps = [],
      business,
      umirc,
      ...currentData
    } = configPlatform.find(
      (item) => item.key === (ENV_PLATFORM_KEY || cache.key),
    ) || configPlatform[0];
    // 获取当前选中的 app 应用
    const currentApp =
      apps.find((item) => item.key === cache.app?.key) || apps[0] || {};

    const values = {
      ...currentData,
      name: ENV_PLATFORM_KEY
        ? currentData.name
        : currentData.alias || currentData.name,
      app: currentApp,
      apps,
      proxy: currentApp.proxy || currentData.proxy,
    };

    // 如果有业务参数，则注入到 window 中
    if (business) {
      const { path = 'business', ...biz } = business;
      window[path] = biz;
    }

    storageSQL('delete', { where: 'sys=env' });
    this.set(values);
  },
  get() {
    return storageSQL('find', { where: 'sys=env' });
  },
  set(values = {}) {
    const cache = this.get();

    storageSQL('duplicate', {
      where: 'sys=env',
      values: {
        ...cache,
        ...values,
        sys: 'env',
      },
    });
  },
  /**
   * 编译环节的参数获取
   * */
  nodeInit(platformKey) {
    const { umirc = {}, ...res } = platformKey
      ? configPlatform.find((item) => item.key === platformKey)
      : {};
    return {
      ...res,
      umirc: {
        base: '/',
        publicPath: '/',
        ...umirc,
      },
    };
  },
};

export default platformStorage;
