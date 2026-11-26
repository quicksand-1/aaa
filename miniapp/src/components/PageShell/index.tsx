import type { ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { logoutWithConfirm } from '@/utils/logout'
import type { CurrentUser } from '@/types/auth'
import './index.scss'

type TabKey = 'home' | 'chat' | 'modules' | 'profile'

interface PageShellProps {
  title: string
  activeTab?: TabKey
  user?: CurrentUser
  loading?: boolean
  showBack?: boolean
  onBrandClick?: () => void
  children: ReactNode
}

const TABS: Array<{ key: TabKey; label: string; path: string }> = [
  { key: 'home', label: '首页', path: '/pages/home/index' },
  { key: 'chat', label: '对话', path: '/pages/chat/index' },
  { key: 'modules', label: '模块', path: '/pages/modules/index' },
  { key: 'profile', label: '我的', path: '/pages/profile/index' },
]

const statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 0

function userInitial(user?: CurrentUser): string {
  return user?.name?.slice(0, 1) || user?.account?.slice(0, 1) || '我'
}

export default function PageShell({
  title,
  activeTab,
  user,
  loading,
  showBack = false,
  onBrandClick,
  children,
}: PageShellProps) {
  const goBack = () => {
    if (getCurrentPages().length > 1) {
      Taro.navigateBack()
    } else {
      Taro.reLaunch({ url: '/pages/home/index' })
    }
  }

  const openUserMenu = async () => {
    try {
      const result = await Taro.showActionSheet({
        itemList: ['个人中心', '修改密码', '退出登录'],
      })

      if (result.tapIndex === 0) {
        Taro.reLaunch({ url: '/pages/profile/index' })
      }
      if (result.tapIndex === 1) {
        Taro.navigateTo({ url: '/pages/password/index' })
      }
      if (result.tapIndex === 2 && (await logoutWithConfirm())) {
        Taro.reLaunch({ url: '/pages/login/index' })
      }
    } catch {
      // 取消操作菜单时不需要额外提示。
    }
  }

  if (loading || !user) {
    return (
      <View className='page-loading'>
        <Text>正在加载工作台…</Text>
      </View>
    )
  }

  return (
    <View className='page-shell'>
      <View className='page-header' style={{ paddingTop: `${statusBarHeight}px` }}>
        <View className='page-header__bar'>
          <View className='page-header__side'>
            {showBack ? (
              <View className='page-header__back' onClick={goBack}>
                <Text>‹</Text>
              </View>
            ) : (
              <View
                className={`page-header__brand ${onBrandClick ? 'is-clickable' : ''}`}
                onClick={onBrandClick}
              >
                {onBrandClick ? (
                  <View className='page-header__menu-icon'>
                    <View />
                    <View />
                    <View />
                  </View>
                ) : (
                  <Text>业</Text>
                )}
              </View>
            )}
          </View>
          <Text className='page-header__title'>{title}</Text>
          <View className='page-header__avatar' onClick={openUserMenu}>
            <Text>{userInitial(user)}</Text>
          </View>
        </View>
      </View>

      <View className='page-content'>
        {children}
        <View className='page-copyright'>
          <Text>业务工作台 · 安全访问</Text>
        </View>
      </View>

      {activeTab ? (
        <View className='bottom-nav'>
          <View className='bottom-nav__inner'>
            {TABS.map((tab) => {
              const active = tab.key === activeTab
              return (
                <View
                  key={tab.key}
                  className={`bottom-nav__item ${active ? 'is-active' : ''}`}
                  onClick={() => {
                    if (!active) Taro.reLaunch({ url: tab.path })
                  }}
                >
                  <View className='bottom-nav__mark' />
                  <Text>{tab.label}</Text>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}
    </View>
  )
}
