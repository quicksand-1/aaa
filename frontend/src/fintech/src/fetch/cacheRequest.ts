/**
 * 缓存加载技术
 * 会将请求后的结果缓存到 cacheStore 中，当有相同的请求时，会直接从缓存中获取数据
 * */

import _paramsSortStringify from '../utils/_paramsSortStringify';
import request from './request';

const cacheStore = new Map(); // 使用 Map 管理缓存

export default (url: string, { cache = true, ...options }) => {
  return new Promise((resolve) => {
    // 唯一标识符：基于请求参数生成唯一的缓存 key
    const windowsKey = _paramsSortStringify({
      url,
      ...options?.params,
      ...options?.data,
    });

    // 如果缓存中已经存在该请求的 Promise，直接返回其结果
    if (cache && cacheStore.has(windowsKey)) {
      const { promise } = cacheStore.get(windowsKey);
      promise.then(resolve);
      return;
    }

    // 发起网络请求，并缓存 Promise
    const fetchPromise = request(url, options).then((res: object) => {
      // 执行回调函数，通知调用方数据已加载完成
      resolve(res);

      return res;
    });

    if (cache) {
      // 缓存请求状态和 Promise
      cacheStore.set(windowsKey, { promise: fetchPromise });
    }
  });
};
