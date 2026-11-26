/*
 * 重定向函数，包含已登录和未登录
 * */
import { history } from '@umijs/max';
import storageSQL from '../../src/utils/storageSQL';

const where = 'key=login';

export default {
  /**
   * 在业务页面登录状态失效 or 主动退出登录时，先缓存当前页面路由
   * */
  set(values = {}) {
    storageSQL('duplicate', {
      where,
      values: { key: 'login', ...values },
    });
  },
  /**
   * 获取当前缓存的页面路由
   * @可能被调用的场景
   *   1、Home 中间件
   * */
  get() {
    return storageSQL('find', { where });
  },
  /**
   * 移除当前缓存的页面路由
   * @可能被调用的场景
   *   1、Home 中间件
   * */
  remove() {
    storageSQL('delete', { where });
  },
  noLogin() {
    const { pathname, search } = location;

    const path = decodeURIComponent(`${pathname}${search}`);
    this.set({ path, desc: '未登录', type: 'noLogin' });
    history.replace('/');
  },
  login() {
    this.set({ desc: '登录成功', type: 'login' });
    history.replace('/');
  },
};
