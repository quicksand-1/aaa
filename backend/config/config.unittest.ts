import path from 'path';
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;
  config.database = {
    file:
      process.env.TEST_DB_FILE ||
      path.join(appInfo.baseDir, 'storage', 'test.sqlite'),
  };
  config.originWhitelist = ['127.0.0.1', 'localhost'];
  config.logger = { consoleLevel: 'WARN' };
  return config;
};
