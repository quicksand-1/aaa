import path from 'path';
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import 'dotenv/config';

export default (appInfo: EggAppInfo): PowerPartial<EggAppConfig> => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.keys = process.env.APP_KEYS || `${appInfo.name}_dev_only_change_me`;
  config.security = {
    csrf: {
      enable: false,
    },
  };
  config.bodyParser = {
    jsonLimit: '1mb',
  };
  // 只信任本机 Nginx 传进来的 X-Forwarded-For
  config.proxy = true;
  config.cluster = {
    listen: {
      port: Number(process.env.PORT || 7001),
      hostname: process.env.HOST || '127.0.0.1',
    },
  };
  config.logger = {
    dir: path.join(appInfo.baseDir, 'logs'),
    consoleLevel: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG',
  };
  // 错误处理必须最外层，Origin 校验在业务路由之前
  config.middleware = ['errorHandler', 'originGuard'];

  const bizConfig = {
    database: {
      file:
        process.env.DB_FILE ||
        path.join(appInfo.baseDir, 'storage', 'dev.sqlite'),
      busyTimeout: 5000,
    },
    auth: {
      cookieName: 'biz_sid',
      normalHours: 12,
      maxFailedAttempts: 5,
      lockMinutes: 15,
    },
    mobileScan: {
      baseUrl: (process.env.MOBILE_QR_BASE_URL || '').trim(),
    },
    // 当前部署凭据属于“深维”小程序，换小程序开发时必须同步替换。
    wechatMiniapp: {
      appId: (process.env.WECHAT_MINIAPP_APP_ID || '').trim(),
      appSecret: (process.env.WECHAT_MINIAPP_APP_SECRET || '').trim(),
    },
    originWhitelist: (process.env.ORIGIN_WHITELIST || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  };

  return {
    ...config,
    ...bizConfig,
  };
};
