import Taro from '@tarojs/taro'
import { logout } from '@/services/auth'

function confirmLogout(): Promise<boolean> {
  return new Promise((resolve) => {
    Taro.showModal({
      title: '确认退出登录？',
      content: '退出后需要重新登录才能继续使用业务工作台。',
      confirmText: '退出登录',
      confirmColor: '#ef4444',
      cancelText: '取消',
      showCancel: true,
      success: (result) => resolve(result.confirm),
      fail: () => resolve(false),
    })
  })
}

export async function logoutWithConfirm(): Promise<boolean> {
  if (!(await confirmLogout())) return false

  try {
    await logout()
  } catch {
    // 本地令牌已在 logout 中清除，即使服务端请求失败也应回到登录页。
  }
  return true
}
