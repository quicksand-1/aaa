import { ApiRequestError, request } from '@/services/request'
import Taro from '@tarojs/taro'
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '@/services/session'
import type {
  CurrentUser,
  LoginResult,
  WechatBindingStatus,
  WechatLoginResult,
} from '@/types/auth'

export async function loginWithPassword(
  account: string,
  password: string,
): Promise<LoginResult> {
  const result = await request<LoginResult>('/login.json', {
    method: 'POST',
    data: { account, password },
  })

  if (!result.sessionToken) {
    throw new Error('登录会话创建失败')
  }

  setSessionToken(result.sessionToken)
  return result
}

async function getWechatCode(): Promise<string> {
  const result = await Taro.login()
  if (!result.code) throw new Error('微信登录失败，请重试')
  return result.code
}

async function requestWithWechatCode<T>(path: string): Promise<T> {
  let code = await getWechatCode()
  try {
    return await request<T>(path, {
      method: 'POST',
      data: { code },
    })
  } catch (error) {
    if (
      !(error instanceof ApiRequestError) ||
      error.errorCode !== 'MINIAPP_WECHAT_CODE_INVALID'
    ) {
      throw error
    }

    code = await getWechatCode()
    return request<T>(path, {
      method: 'POST',
      data: { code },
    })
  }
}

export async function loginWithWechat(): Promise<WechatLoginResult> {
  const result = await requestWithWechatCode<WechatLoginResult>(
    '/miniapp/login.json',
  )
  if (result.bound) {
    setSessionToken(result.sessionToken)
  }
  return result
}

export async function bindWechat(): Promise<void> {
  await requestWithWechatCode('/miniapp/bind.json')
}

export function fetchWechatBinding(): Promise<WechatBindingStatus> {
  return request<WechatBindingStatus>('/miniapp/binding.json')
}

export function unbindWechat(): Promise<void> {
  return request('/miniapp/binding.json', { method: 'DELETE' })
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>('/system/user/info.json')
}

export async function logout(): Promise<void> {
  try {
    if (getSessionToken()) {
      await request('/logout.json')
    }
  } finally {
    clearSessionToken()
  }
}
