import filterRoutes from '../src/fintech/frame/global/filterRoutes';

const routers = [
  {
    layout: false,
    path: '/',
    component: '@/fintech/frame/middleware',
  },
  {
    layout: false,
    path: '/login',
    component: './login',
  },
  {
    layout: false,
    path: '/info',
    name: '首页',
    component: './home',
  },
  {
    path: '/admin',
    name: '后台管理',
    access: 'admin',
    hideInMenu: true,
    component: './admin',
  },
  {
    path: '/settings',
    name: '个人设置',
    hideInMenu: true,
    component: './settings',
  },
  {
    path: '/m/scan',
    layout: false,
    component: './mobile/scan',
  },
  {
    path: '/m',
    layout: false,
    component: '@/layouts/MobileLayout',
    routes: [
      { path: '/m', redirect: '/m/home' },
      { path: '/m/home', component: './mobile/home' },
      { path: '/m/chat', component: './mobile/chat' },
      { path: '/m/modules', component: './mobile/modules' },
      { path: '/m/profile', component: './mobile/profile' },
      {
        path: '/m/profile/password',
        component: './mobile/profile/Password',
      },
    ],
  },
  { path: '/*', component: '@/fintech/frame/404' },
];

export default filterRoutes.runtimeBuild(routers as never[]);
