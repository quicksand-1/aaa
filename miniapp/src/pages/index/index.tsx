import Taro, { useDidShow } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { fetchCurrentUser } from '@/services/auth'
import { clearSessionToken, getSessionToken } from '@/services/session'
import './index.scss'

export default function Index() {
  useDidShow(() => {
    if (!getSessionToken()) {
      Taro.reLaunch({ url: '/pages/login/index' })
      return
    }

    fetchCurrentUser()
      .then((user) => {
        Taro.reLaunch({
          url: user.needModifiedPwd
            ? '/pages/password/index?forced=1'
            : '/pages/home/index',
        })
      })
      .catch(() => {
        clearSessionToken()
        Taro.reLaunch({ url: '/pages/login/index' })
      })
  })

  return (
    <View className='boot-page'>
      <View className='boot-page__logo'>
        <Text>业</Text>
      </View>
      <Text className='boot-page__name'>业务工作台</Text>
      <Text className='boot-page__hint'>正在进入工作台…</Text>
    </View>
  )
}
