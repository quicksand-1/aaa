import { useCallback, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { fetchCurrentUser } from '@/services/auth'
import { ApiRequestError } from '@/services/request'
import { clearSessionToken, getSessionToken } from '@/services/session'
import type { CurrentUser } from '@/types/auth'

export function useCurrentUser(allowModifiedPassword = false) {
  const [user, setUser] = useState<CurrentUser>()
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!getSessionToken()) {
      setLoading(false)
      Taro.reLaunch({ url: '/pages/login/index' })
      return
    }

    setLoading(true)
    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)

      if (currentUser.needModifiedPwd && !allowModifiedPassword) {
        Taro.reLaunch({ url: '/pages/password/index?forced=1' })
      }
    } catch (error) {
      clearSessionToken()
      setUser(undefined)
      if (error instanceof ApiRequestError && error.statusCode === 401) {
        Taro.showToast({ title: '登录状态已失效', icon: 'none' })
      }
      Taro.reLaunch({ url: '/pages/login/index' })
    } finally {
      setLoading(false)
    }
  }, [allowModifiedPassword])

  useDidShow(() => {
    void load()
  })

  return { user, setUser, loading, reload: load }
}
