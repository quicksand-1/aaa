export const API_BASE_URL = (
  process.env.TARO_APP_API_BASE || 'http://127.0.0.1:7001/api'
).replace(/\/+$/, '')

export const CLIENT_TYPE = 'miniapp'
