// @ts-nocheck
/**
 * 应用主启动配置文件，包含全局状态管理、路由渲染处理、布局设置、统一请求设置等
 * */

import React from 'react';
import { Avatar, Watermark, message } from 'antd';
import { history, request as umiRequest } from '@umijs/max';
import { RightContent } from '@/components';
import { Copyright } from 'frame/components';
import PasswordForceGuard from 'frame/login/PasswordForceGuard';
import platformStorage from 'frame/global/platformStorage';
import filterRoutes from 'frame/global/filterRoutes';
import redirect from 'frame/global/redirect';

/**
 * 以下页面不需要进行重定向和 info 数据请求
 * */
const validateAuthBeforeNonLoginRoutes = () => {
  const PATHS = new Set(['/', '/login', '/m/scan']);
  return !PATHS.has(location.pathname);
};

// 平台数据初始化
platformStorage.init();
const { name, logo, proxy, copyright, watermark } = platformStorage.get();

/**
 * 全局初始化数据配置
 * @url: https://next.umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<any> {
  if (!validateAuthBeforeNonLoginRoutes()) {
    return { currentUser: {} };
  }

  try {
    const res: any = await umiRequest('/system/user/info.json', {
      showError: false,
    });
    return { currentUser: res?.data || {} };
  } catch {
    redirect.noLogin();
    return { currentUser: {} };
  }
}

/**
 * 布局设置
 * @url：https://umijs.org/docs/max/layout-menu#%E8%BF%90%E8%A1%8C%E6%97%B6%E9%85%8D%E7%BD%AE
 * */
export const layout = ({ initialState }) => {
  return {
    style: { height: '100vh' },
    layout: 'side',
    title: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          lineHeight: 1.35,
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
        <span
          style={{
            color: '#ffffff',
            fontSize: 9,
            opacity: 0.55,
            whiteSpace: 'nowrap',
          }}
        >
          通用业务管理平台
        </span>
      </div>
    ),
    logo: logo ? (
      <Avatar
        src={logo}
        alt="logo"
        shape="square"
        size={32}
        style={{ borderRadius: 8 }}
      />
    ) : (
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          width: 32,
          height: 32,
          flexShrink: 0,
          placeItems: 'center',
          borderRadius: 8,
          background: '#ffffff',
          color: '#1677ff',
          fontSize: 17,
          fontWeight: 900,
        }}
      >
        业
      </span>
    ),
    breakpoint: false,
    defaultCollapsed: false,
    menu: {
      locale: false,
      // 菜单始终保持展开，避免切换页面后收起导致入口难以定位。
      defaultOpenAll: true,
      ignoreFlatMenu: true,
    },
    siderWidth: 180,
    contentStyle: {
      padding: '20px 22px 36px',
      overflow: 'auto',
    },
    pageTitleRender: (_props, _defaultTitle, info) => {
      const pageName = typeof info?.pageName === 'string' ? info.pageName : '';
      return pageName && pageName !== name ? `${pageName} - ${name}` : name;
    },
    // 点击页面左上角的 title 区域时，会触发
    onMenuHeaderClick: () => {
      history.replace(platformStorage.get().redirect || '/welcome');
    },
    // 自定义内容
    childrenRender: (Com) => {
      const content = watermark ? (
        <Watermark
          gap={[200, 200]}
          content={`${watermark.prefix}-${initialState?.currentUser?.account}`}
        >
          {Com}
        </Watermark>
      ) : (
        Com
      );

      return (
        <>
          {content}
          <PasswordForceGuard />
        </>
      );
    },
    menuFooterRender: (props) => <RightContent collapsed={props?.collapsed} />,
    footerRender: () => <Copyright show={copyright} />,
    /**
     * 自定义过滤菜单的 menuData 方法，只会过滤菜单数据，并不会对路由数据进行过滤
     * */
    menuDataRender: (menuData: any) =>
      filterRoutes.menuDataRender({
        menuData,
        access: initialState?.currentUser?.authFunctionList || [],
      }),
    /**
     * 这里设置 layout 相关的 theme token
     * https://pro-components.antdigital.dev/components/layout
     * 官方demo：https://pro-components.antdigital.dev/components/layout?tab=api#packages-layout-src-components-layout-tab-api-demo-theme
     * */
    token: {
      sider: {
        colorMenuBackground: '#001529',
        colorBgHeader: '#001529',
        colorHeaderTitle: '#ffffff',
        colorTextMenu: '#ffffffd9',
        colorTextMenuItemHover: '#ffffff',
        colorTextMenuActive: '#ffffff',
        colorTextMenuSelected: '#ffffff',
        colorBgMenuItemHover: '#ffffff14',
        colorBgMenuItemSelected: '#1677ff',
        colorBgMenuItemActive: '#ffffff14',
      },
    },
  };
};

/**
 * request 配置项，它是基于axios 封装的
 * @url：https://umijs.org/docs/max/request
 * @axios：https://github.com/axios/axios#request-config
 * */

/**
 * 统一处理业务错误码，供 errorHandler 和 responseInterceptors 共用。
 *
 * 处理流程：
 * 1. UNLOGIN → 提示并重定向至登录页
 * 2. DENY → 只提示无权限，不跳登录页，避免把越权误判成掉线
 * 3. LOGIN_FAILED / LOGIN_LOCKED → 登录页提示
 *
 * @param data - 响应体数据，需包含 errorCode 或 code 字段
 * @returns 是否命中已知业务错误码。true 表示已处理，调用方无需再处理；false 表示未命中，调用方需自行兜底
 * */
const handleBizErrorCode = (data: any) => {
  const code = data?.errorCode || data?.code;

  if (code === 'UNLOGIN') {
    message.error(data.errorMessage || '请先登录', 1);
    if (validateAuthBeforeNonLoginRoutes()) {
      redirect.noLogin();
    }
    return true;
  }

  if (code === 'DENY') {
    message.error(data.errorMessage || '没有权限执行该操作', 1);
    return true;
  }

  if (code === 'LOGIN_FAILED' || code === 'LOGIN_LOCKED') {
    message.error(data.errorMessage || '登录失败', 1);
    return true;
  }

  return false;
};

export const request = {
  baseURL: proxy,
  withCredentials: true,
  errorConfig: {
    errorThrower(res) {
      console.log('errorThrower');
      const { success, errorMessage } = res;
      if (!success) {
        // 外贸安全固定，不能有具体的登录报错信息
        if (location.pathname.includes('/login')) {
          message.error('登录失败');
        } else {
          message.error(errorMessage || '系统异常');
        }
      }
    },
    /**
     * request options 配置项中如果 showError=false，则不会触发 message 提示
     * */
    errorHandler(error) {
      console.log('errorHandler');
      if (error.config?.showError === false) return;

      const data = error.response?.data;
      if (data && handleBizErrorCode(data)) return;

      message.error(data?.errorMessage || error.message);
    },
  },
  /**
   * 发送请求前的拦截器
   * 1、支持组件级别的 loading 劫持
   * */
  requestInterceptors: [
    // 额外请求头设计
    (config) => ({
      ...config,
      headers: {
        ...config.headers,
        // 'Platform': plfStorage.key,
      },
    }),
    // 其他特殊处理
    (url: string, options: object) => {
      return { url, options };
    },
  ],
  /**
   * 请求结束后的拦截器
   * */
  responseInterceptors: [
    // 对登录失效等情况进行拦截处理
    (response: AxiosResponse) => {
      const { data } = response;

      handleBizErrorCode(data);

      return response;
    },
  ],
};
