import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;
  config.workers = 1;
  config.logger = { level: 'INFO', consoleLevel: 'INFO' };
  return config;
};
