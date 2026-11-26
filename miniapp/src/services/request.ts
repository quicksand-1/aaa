import Taro from '@tarojs/taro'
import { API_BASE_URL, CLIENT_TYPE } from '@/config'
import { getSessionToken } from '@/services/session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  errorCode?: string
  errorMessage?: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  data?: Record<string, unknown>
}

export class ApiRequestError extends Error {
  statusCode?: number
  errorCode?: string

  constructor(message: string, statusCode?: number, errorCode?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getSessionToken()
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Type': CLIENT_TYPE,
  }
  if (token) header.Authorization = `Bearer ${token}`

  let response: Taro.request.SuccessCallbackResult<ApiResponse<T>>
  try {
    response = await Taro.request<ApiResponse<T>>({
      url: `${API_BASE_URL}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: 15000,
    })
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'errMsg' in error
        ? String(error.errMsg)
        : '网络连接失败'
    throw new ApiRequestError(message)
  }

  const body = response.data
  if (
    response.statusCode >= 200 &&
    response.statusCode < 300 &&
    body?.success
  ) {
    return body.data as T
  }

  throw new ApiRequestError(
    body?.errorMessage || '请求失败',
    response.statusCode,
    body?.errorCode,
  )
}
