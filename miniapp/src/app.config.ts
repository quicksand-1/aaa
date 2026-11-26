export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/home/index',
    'pages/modules/index',
    'pages/profile/index',
    'pages/password/index',
    'pages/chat/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    backgroundColor: '#f8fafc',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '业务工作台',
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom'
  }
})
