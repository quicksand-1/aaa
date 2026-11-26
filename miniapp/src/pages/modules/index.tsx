import { Text, View } from '@tarojs/components'
import PageShell from '@/components/PageShell'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import './index.scss'

const STEPS = ['新增页面', '登记路由', '接入接口', '补充权限']

export default function Modules() {
  const { user, loading } = useCurrentUser()

  return (
    <PageShell title='模块' activeTab='modules' user={user} loading={loading}>
      <View className='modules-page'>
        <View className='modules-intro'>
          <Text className='modules-intro__title'>业务模块</Text>
          <Text className='modules-intro__description'>
            这里是移动端业务入口。模块接入后，可按权限展示在页面中，并同步加入底部导航。
          </Text>
        </View>

        <View className='card empty-state modules-empty'>
          <View className='empty-state__mark'>
            <Text>▦</Text>
          </View>
          <Text className='empty-state__text'>当前还没有接入业务模块</Text>
        </View>

        <View className='modules-steps'>
          <Text className='modules-steps__title'>模块接入步骤</Text>
          <View className='modules-steps__grid'>
            {STEPS.map((step, index) => (
              <View key={step} className='modules-step card'>
                <Text className='modules-step__number'>{index + 1}</Text>
                <Text className='modules-step__label'>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </PageShell>
  )
}
