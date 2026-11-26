/**
 * 路由中间件
 * @PS：由于不同的系统或业务，在登录后跳转的首页是不同的，所以在此中间页进行跳转处理
 * @跳转方向：
 *   --> sso 登录页面
 *   --> 框架自带的登录页面
 *   --> 业务页面
 * */

import { history } from '@umijs/max';
import { Spin } from 'antd';
import { request } from 'fintech';
import { useEffect } from 'react';
import platformStorage from '../global/platformStorage';
import redirect from '../global/redirect';

export default () => {
  useEffect(() => {
    const { path, type } = redirect.get();
    const { ssoToken, ...platformConfig } = platformStorage.get();
    const locationSearch = new URLSearchParams(location.search);
    const token = locationSearch.get(ssoToken); // 获取页面的 token 信息

    /**
     * 前往业务页面
     * */
    const goContentPath = () => {
      if (path) {
        redirect.remove();
        location.href = path;
      } else {
        location.href = platformConfig.redirect || '/welcome';
      }
    };

    // 如果有 sso 配置，且浏览器参数中有 token 信息
    if (ssoToken && token) {
      // sso 登录校验
      request('/sso/login.json', {
        method: 'POST',
        data: {
          token,
          callService: location.origin,
        },
      }).then(() => {
        goContentPath();
      });
      return;
    }

    // 如果是未登录状态
    if (type === 'noLogin') {
      // 如果有 sso 配置
      if (ssoToken) {
        request('/aaa/getLoginUrl.json').then((ssoUrl) => {
          if (ssoUrl) {
            location.href = `${ssoUrl}${location.origin}&SSOLOGOUT=true`;
          } else {
            // 跳转到框架自带的登录页面
            history.replace('/login');
          }
        });
      } else {
        // 跳转到框架自带的登录页面
        history.replace('/login');
      }
      return;
    }

    goContentPath();
  }, []);

  return (
    <Spin spinning>
      <div style={{ width: '100vw', height: '100vh' }} />
    </Spin>
  );
};
