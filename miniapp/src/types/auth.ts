export type PermissionAction = 'read' | 'edit' | 'download'

export interface CurrentUser {
  id: number
  account: string
  name: string
  role: string
  isAdmin: boolean
  needModifiedPwd: boolean
  permissions: Record<string, Record<PermissionAction, boolean>>
  authFunctionList: string[]
}

export interface LoginResult {
  needModifiedPwd: boolean
  sessionToken: string
}

export interface WechatBindingStatus {
  bound: boolean
}

export type WechatLoginResult =
  | { bound: false }
  | {
      bound: true
      sessionToken: string
      needModifiedPwd: boolean
    }
