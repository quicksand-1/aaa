// @ts-nocheck
/**
 * 获取地址栏 search 参数
 * */
import storageSQL from './storageSQL';

type Params = {
  [paramsName: string]: any;
};

function getUrlParams(storageParams?: object) {
  /**
   * 获取本地缓存参数，搭配 LinkBtn 的 params 来使用
   * */
  if (storageParams) {
    const { key = location.pathname, from, destroy = false } = storageParams;

    // 获取参数
    const obj = storageSQL('find', { from, where: `key=${key}` });
    if (destroy) {
      storageSQL('delete', { from, where: `key=${key}` });
    }

    return obj;
  }

  const searchParams = new URLSearchParams(location.search);

  let curParams: Params = {};

  for (let pair of searchParams.entries()) {
    curParams[pair[0]] = pair[1];
  }

  return curParams;
}

export default getUrlParams;
