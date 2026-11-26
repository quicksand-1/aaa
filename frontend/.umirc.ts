import { defineConfig } from '@umijs/max';
import routes from './config/routes';
import command2param from './src/fintech/frame/global/command2param';
import platformStorage from './src/fintech/frame/global/platformStorage';

const path = require('path');

// 获取命令行参数
const { platformKey } = command2param(process.argv);
const { umirc = {}, key }: any = platformStorage.nodeInit(platformKey);

export default defineConfig({
  // start: map 相关配置
  // mpa: {
  //   template: './map/templates/default.html',
  //   getConfigFromEntryFile: true,
  //   layout: '../../../map/layouts/basic',
  //   // entry: {
  //   //   chat: { description: 'chat is 插件' },
  //   // },
  // },
  // mountElementId: 'chat',
  // end: map 相关配置

  hash: true, // build 产物包含hash值
  // fintech/x 直接引用 React hooks；关闭 MFSU，避免开发态 vendor 与业务源码各加载一份 React。
  mfsu: false,
  antd: {
    /**
     * https://ant-design.antgroup.com/components/config-provider-cn#config-provider-demo-theme
     * 这里设置全局的 antd 的 theme token
     * */
    // import: false,
    configProvider: {
      theme: {
        token: {
          borderRadius: 2,
        },
      },
    },
    // styleProvider: {
    //   hashPriority: 'high',
    //   legacyTransformer: true,
    // },
  },
  access: {},
  model: {},
  // mock: false, // 是否开启 mockjs 进行数据接口模拟
  initialState: {},
  request: {},
  layout: {},
  esbuildMinifyIIFE: true,
  // 配置关闭dynamicImport
  extraBabelPlugins:
    process.env.NODE_ENV === 'production'
      ? ['babel-plugin-dynamic-import-node']
      : [],
  /**
   * 开发环境的代理配置
   * PS：
   *   1、如果需要支持 sse，则需要在 package.json 中加入环境变量 UMI_DEV_SERVER_COMPRESS=none
   *     - 参考链接：https://umijs.org/docs/guides/env-variables#umi_dev_server_compress
   * */
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:7001',
      // 保留浏览器原始 Host，避免局域网 IP 访问时被后端 Origin 校验拒绝
      changeOrigin: false,
    },
  },
  routes,
  npmClient: 'npm',
  define: {
    PUBLIC_PATH: umirc.publicPath,
    // 当前执行的平台标识，如果为空，则在页面右上角会有平台切换的组件
    ENV_PLATFORM_KEY: key,
    // 版本号，在 Copyright 中展示
    VERSION: process.env.npm_package_version,
    // 打包时间，在 Copyright 中展示
    BUILD_TIME: new Date().toISOString().slice(0, 10),
  },
  alias: {
    config: path.resolve(__dirname, 'config'),
    fintech: path.resolve(__dirname, 'src/fintech/src'),
    frame: path.resolve(__dirname, 'src/fintech/frame'),
    react: path.resolve(__dirname, 'node_modules/react'),
    'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
  },
  /**
   * 自定义颜色变量
   * demo: 在下面的变量中，设定了 platform 属性，然后在 global.less 中使用
   *   & when (@platform = tj) {
   *     .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
   *       background-color: #1890ff;
   *       color: #fff;
   *     }
   *   }
   *
   *   解释：(@platform = tj)，当平台设置时 tj 时，下面的样式才会生效
   * */
  // lessLoader: {
  //   modifyVars: {
  //     // 天津信托要求菜单可视性高一些
  //     platform: ENV_PLATFORM_KEY,
  //   },
  //   javascriptEnabled: true,
  // },
  ...umirc,
  tailwindcss: {},
});
