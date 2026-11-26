import { defineConfig } from 'dumi';

const path = require('path');

export default defineConfig({
  base: '/docs/',
  outputPath: 'dist',
  theme: { '@c-primary': '#9F6415' },
  themeConfig: {
    name: '资质工作台',
    socialLinks: {
      gitlab: 'http://gitlab.abssqr.cn/web/fintech',
    },
    logo: false,
    footer:
      'Open-source MIT Licensed',
    nav: [
      {
        title: '组件',
        link: '/components/link-btn',
      },
      {
        title: '方法',
        link: '/utils/clipboard',
      },
      {
        title: '小工具',
        link: '/tools',
      },
    ],
  },
  favicons: ['/logo.png'],
  styles: ['/global.css'],
  scripts: ['/global.js'],
  resolve: {
    // docDirs: [{ type: 'doc', dir: 'docs' }],
    atomDirs: [{ type: 'component', dir: 'src' }],
  },
  alias: {
    fintech: path.resolve(__dirname, 'src/'),
  },
  proxy: {
    '/m1': {
      target: 'https://apifoxmock.com',
      changeOrigin: true,
      pathRewrite: { '^/m1': '/m1/4778312-0-default' },
    },
    '/system': {
      target: 'https://apifoxmock.com/m1/4778312-0-default',
      changeOrigin: true,
    },
  },
  mfsu: false,
});
