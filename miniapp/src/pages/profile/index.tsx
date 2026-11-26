import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Text, View } from '@tarojs/components'
import PageShell from '@/components/PageShell'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { fetchWechatBinding, unbindWechat } from '@/services/auth'
import { logoutWithConfirm } from '@/utils/logout'
import './index.scss'

function initial(name?: string, account?: string): string {
  return name?.slice(0, 1) || account?.slice(0, 1) || '我'
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败，请稍后重试'
}

export default function Profile() {
  const { user, loading } = useCurrentUser()
  const [wechatBound, setWechatBound] = useState(false)
  const [bindingLoading, setBindingLoading] = useState(true)

  const loadBinding = async () => {
    try {
      const result = await fetchWechatBinding()
      setWechatBound(result.bound)
    } catch {
      setWechatBound(false)
    } finally {
      setBindingLoading(false)
    }
  }

  useDidShow(() => {
    void loadBinding()
  })

  const handleLogout = async () => {
    if (await logoutWithConfirm()) {
      Taro.reLaunch({ url: '/pages/login/index' })
    }
  }

  const handleUnbind = async () => {
    if (bindingLoading) return
    if (!wechatBound) {
      Taro.showToast({ title: '当前账号尚未绑定微信', icon: 'none' })
      return
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      Taro.showModal({
        title: '确认解绑微信？',
        content: '解绑后，本账号下次打开小程序需要使用账号密码登录。',
        confirmText: '确认解绑',
        confirmColor: '#ef4444',
        cancelText: '取消',
        success: (result) => resolve(result.confirm),
        fail: () => resolve(false),
      })
    })
    if (!confirmed) return

    setBindingLoading(true)
    try {
      await unbindWechat()
      setWechatBound(false)
      Taro.showToast({ title: '微信已解绑', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: errorMessage(error), icon: 'none' })
    } finally {
      setBindingLoading(false)
    }
  }

  return (
    <PageShell title='我的' activeTab='profile' user={user} loading={loading}>
      <View className='profile-page'>
        <View className='profile-card card'>
          <View className='profile-card__avatar'>
            <Text>{initial(user?.name, user?.account)}</Text>
          </View>
          <View className='profile-card__body'>
            <View className='profile-card__name-row'>
              <Text className='profile-card__name'>{user?.name || '当前用户'}</Text>
              {user?.isAdmin ? (
                <Text className='profile-card__badge'>管理员</Text>
              ) : null}
            </View>
            <Text className='profile-card__account'>{user?.account || '-'}</Text>
            <Text className='profile-card__role'>角色：{user?.role || '-'}</Text>
          </View>
        </View>

        <View className='profile-actions card'>
          <View
            className='profile-action'
            onClick={() => Taro.navigateTo({ url: '/pages/password/index' })}
          >
            <View className='profile-action__mark'>
              <Text>密</Text>
            </View>
            <View className='profile-action__body'>
              <Text className='profile-action__label'>修改密码</Text>
              <Text className='profile-action__description'>更新当前登录密码</Text>
            </View>
            <Text className='profile-action__arrow'>›</Text>
          </View>

          <View
            className={`profile-action ${wechatBound ? '' : 'is-muted'}`}
            onClick={handleUnbind}
          >
            <View className='profile-action__mark'>
              <Text>微</Text>
            </View>
            <View className='profile-action__body'>
              <Text className='profile-action__label'>微信解绑</Text>
              <Text className='profile-action__description'>
                {bindingLoading
                  ? '正在查询绑定状态'
                  : wechatBound
                    ? '已绑定当前微信，可免密登录'
                    : '当前账号尚未绑定微信'}
              </Text>
            </View>
            <Text className='profile-action__arrow'>›</Text>
          </View>
        </View>

        <Button className='profile-logout' onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </PageShell>
  )
}
