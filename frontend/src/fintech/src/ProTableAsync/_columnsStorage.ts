/**
 * 获取 columns 的 setting 后的缓存数据
 * */

export default (persistenceKey = '') => {
  return JSON.parse(localStorage.getItem(persistenceKey) || '{}');
};
