import Taro from '@tarojs/taro'

const SESSION_TOKEN_KEY = 'businessWorkbenchSessionToken'

export function getSessionToken(): string {
  return String(Taro.getStorageSync(SESSION_TOKEN_KEY) || '')
}

export function setSessionToken(token: string): void {
  Taro.setStorageSync(SESSION_TOKEN_KEY, token)
}

export function clearSessionToken(): void {
  Taro.removeStorageSync(SESSION_TOKEN_KEY)
}
