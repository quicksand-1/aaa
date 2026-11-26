import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import PageShell from '@/components/PageShell'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import './index.scss'

const QUICK_ACTIONS = [
  {
    key: 'modules',
    label: '业务模块',
    description: '查看当前已接入模块',
    mark: '模',
    path: '/pages/modules/index',
  },
  {
    key: 'profile',
    label: '个人中心',
    description: '账号与安全设置',
    mark: '我',
    path: '/pages/profile/index',
  },
  {
    key: 'password',
    label: '修改密码',
    description: '更新当前登录密码',
    mark: '密',
    path: '/pages/password/index',
  },
]

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export default function Home() {
  const { user, loading } = useCurrentUser()

  return (
    <PageShell title='首页' activeTab='home' user={user} loading={loading}>
      <View className='home-page'>
        <View className='home-hero'>
          <View className='home-hero__top'>
            <View>
              <Text className='home-hero__greeting'>
                {greeting()}
                {user?.name ? `，${user.name}` : ''}
              </Text>
              <Text className='home-hero__title'>欢迎使用业务工作台</Text>
            </View>
            {user?.isAdmin ? (
              <Text className='home-hero__badge'>管理员</Text>
            ) : null}
          </View>
          <Text className='home-hero__description'>
            登录、权限和请求能力已与现有后台打通，后续业务页面可直接接入。
          </Text>
        </View>

        <View className='home-section'>
          <View className='section-title-row'>
            <Text className='section-title'>快捷入口</Text>
            <Text className='section-meta'>常用功能</Text>
          </View>
          <View className='home-actions'>
            {QUICK_ACTIONS.map((item) => (
              <View
                key={item.key}
                className='home-action card'
                onClick={() => {
                  if (item.key === 'password') {
                    Taro.navigateTo({ url: item.path })
                  } else {
                    Taro.reLaunch({ url: item.path })
                  }
                }}
              >
                <View className='home-action__mark'>
                  <Text>{item.mark}</Text>
                </View>
                <View className='home-action__body'>
                  <Text className='home-action__label'>{item.label}</Text>
                  <Text className='home-action__description'>
                    {item.description}
                  </Text>
                </View>
                <Text className='home-action__arrow'>›</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='home-section'>
          <View className='section-title-row'>
            <Text className='section-title'>业务概览</Text>
            <Text className='section-meta'>实时数据</Text>
          </View>
          <View className='card empty-state'>
            <View className='empty-state__mark'>
              <Text>▦</Text>
            </View>
            <Text className='empty-state__text'>
              暂无业务数据，接入模块后将在这里展示
            </Text>
          </View>
        </View>
      </View>
    </PageShell>
  )
}
