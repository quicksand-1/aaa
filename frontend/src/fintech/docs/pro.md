---
title: Pro 框架介绍
---

底层由 umi@max 支持，在此基础上拓展属于我们自己的 [框架](http://gitlab.abssqr.cn/web/pro)

## 多机构支持

> 相同的系统，我们会对接多个机构，而每个机构都有自己独立的配置信息，为了能更好的区别机构之间的差异性和更好的维护性，我们提供了一些配置项，用于解决这些问题。

- 配置文件：`/config/platform.ts`
- 命令行重要参数：`plf=<机构标识>`
  - 示例：`npm start plf=wm` `bash build.sh plf=wm`
  - 说明：如果命令中没有 plf 参数，则在页面右上角会展示切换机构的按钮（一般用于开发环境或测试环境）

### 参数明细

<Tree>
  <ul>
    <li>access<small>【boolean】权限控制器，默认开启；设置为 false 时，会关闭权限校验，包含菜单和组件</small></li>
    <li>routesSearch<small>【boolean】路由搜索控制器，需要搭配 frame/components/TopRightWidget 使用 </small></li>
    <li>key<small>【*string】机构唯一标识 </small></li>
    <li>name<small>【*string】机构名称 </small></li>
    <li>alias<small>【string】机构别名，一般用于开发环境不暴露机构的真实名称；当启动命令参数中没有 plf 时，权重大于 name </small></li>
    <li>logo<small>【string】机构 logo 图片，请存放于 public 目录下 </small></li>
    <li>proxy<small>【*context-path】代理标识 </small></li>
    <li>copyright<small>【boolean】版权信息控制器，默认开启 </small></li>
    <li>redirect<small>【path】默认路径 / 的重定向路径 </small></li>
    <li>ssoToken<small>【string】第三方登录的 token 关键字 </small></li>
    <li>
      apps<small>【*AppList】应用列表，同一个机构下可能又多个应用 </small>
      <ul>
        <li>key<small>【*string】应用唯一标识 </small></li>
        <li>name<small>【*string】应用名称 </small></li>
        <li>proxy<small>【*context-path】代理标识，优先级大于父级 </small></li>
        <li>...<small> 支持添加自定义配置项 </small></li>
      </ul>
    </li>
    <li>
      umirc<small>【umiConfig】项目中 .umirc.ts 的配置，机构之间可能存在不同 </small>
      <ul>
        <li>base<small>【*string】设置路由前缀，默认 / </small></li>
        <li>publicPath<small>【*string】public 目录访问路径，默认 / </small></li>
        <li>...<small> 支持其他配置 </small></li>
      </ul>
    </li>
    <li>
      login<small>【*object】新版本登录页面配置项 </small>
      <ul>
        <li>logo<small>【string】机构 logo 图片，请存放于 public 目录下，权重大于父级 </small></li>
        <li>name<small>【string】机构名称，权重大于父级；命令中 plf 不存在时，权重：alias > login.name > name </small></li>
        <li>description<small>【string】机构介绍或产品介绍 </small></li>
        <li>copyright<small>【boolean】版权信息控制器，权重大于父级 </small></li>
        <li>remember<small>【boolean】自动登录控制器 </small></li>
        <li>captcha<small>【boolean】验证码控制器 </small></li>
        <li>crypto<small>【string】加密控制器，公钥为空时，默认不加密 </small></li>
      </ul>
    </li>
    <li>
      business<small>【*object】业务配置 </small>
      <ul>
        <li>path<small>【*string】注入到 window 中的主字段，默认是 business </small></li>
        <li>...<small> 和业务相关的配置添加到这里 </small></li>
      </ul>
    </li>
  </ul>
</Tree>

### 参考示例

```jsx | pure
/**
 * config/platform.ts
 * */
export default [
  {
    access: true,
    routesSearch: true,
    key: 'tj',
    name: '天津信托',
    alias: 'bbb',
    logo: '/logo_tj.png',
    proxy: '/credit',
    copyright: true,
    redirect: '/home',
    apps: [
      { key: 'hb', name: '花呗', proxy: '/hb_credit' },
      { key: 'jb', name: '借呗', proxy: '/jb_credit' },
    ],
    business: {
      path: 'g_config',
    },
    umirc: {
      base: '/',
      publicPath: '/',
    },
    login: {
      logo: '/logo_tj.png',
      name: '天津信托',
      description: '普惠金融数据监控和管理平台',
      copyright: false,
      captcha: true,
      crypto:
        '04601c619e409ab7cb739c44afdd1d0295a2e6c2e106decc3e89b1e995b13cfe0fa0e25a71f8f7161e619dde699e2a884d3100253ff2bdfd4c8d10b3f4807c5b53',
    },
  },
];
```

### 非根目录下部署

> 由于外贸、华鑫等线上环境比较特殊，只能提供 tomcat 的二级目录进行部署项目

```jsx | pure
/**
 * config/platform.ts
 * */
[
  {
    ...,
    umirc: {
      base: '/firpt',
      publicPath: '/firpt/',
    },
    ...
  }
]

/**
 * .umirc.ts
 * */
// 获取命令行参数
const { platformKey } = command2param(process.argv);
// 当前执行的平台配置项，默认为第一个
const { umirc } = platformList.find((p) => p.key === platformKey);

export default defineConfig({
  base: umirc.base || '/',
  publicPath: umirc.publicPath || '/',
  ...
})
```

## 路由配置规范

> 在原有的 umi 路由参数上新增加了几个参数，以满足多平台多应用的扩展需求

- [原 umi 路由参考](https://umijs.org/docs/guides/routes)
- access：菜单权限配置
  - 如果 access="mgr"，则该菜单在有 mgr 权限码时才展示
  - 如果 access="mgr/gt"，则该菜单对平台 gt 有权限码校验要求；多个平台可用 "mgr/gt|tj" 来配置
- platform：描述该菜单归属于哪个平台，多平台用 | 分隔
  - `platform="tj"`：该菜单归属于 tj 平台
  - `platform="tj|gt`"：该菜单归属于 tj gt 平台
- app：该菜单归属于哪个应用，多应用用 | 分隔
  - `app="hb"`：该菜单只对 hb 应用展示，其他应用不展示
  - `app="hb|jb`"：该菜单只对 花呗 借呗 应用展示，其他应用不展示

## 权限组件

- [Permission](/components/permission)

## 团队合作

1. 下载代码 `git clone ssh://git@172.16.30.90:3049/web/pro.git`
2. 更改新仓库地址 `bash clone.sh '新仓库地址'`
3. 安装依赖 `npm install`
4. 启动项目 `npm start`，开始编程
