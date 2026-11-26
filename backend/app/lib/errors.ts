/**
 * 错误响应固定为 { success: false, errorCode, errorMessage }，
 * 与 frontend/src/utils/request.ts 的解析逻辑对齐；DENY / UNLOGIN 会被 src/app.tsx 识别。
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: string;

  constructor(status: number, errorCode: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

export const validationError = (message: string) =>
  new ApiError(400, 'VALIDATION_ERROR', message);

export const unlogin = () => new ApiError(401, 'UNLOGIN', '请先登录');

export const loginFailed = () =>
  new ApiError(401, 'LOGIN_FAILED', '账号或密码错误');

export const loginLocked = (minutes: number) =>
  new ApiError(
    429,
    'LOGIN_LOCKED',
    `连续登录失败次数过多，请 ${minutes} 分钟后再试`,
  );

export const deny = (message = '没有权限执行该操作') =>
  new ApiError(403, 'DENY', message);

export const notFound = (message = '记录不存在') =>
  new ApiError(404, 'NOT_FOUND', message);

export const conflict = (message: string) =>
  new ApiError(409, 'CONFLICT', message);

export const miniappIdentityConflict = () =>
  new ApiError(409, 'MINIAPP_IDENTITY_CONFLICT', '当前微信身份已绑定其他账号');

export const miniappIdentityDisabled = () =>
  new ApiError(403, 'MINIAPP_IDENTITY_DISABLED', '当前微信身份已被停用');

export const miniappWechatUnavailable = () =>
  new ApiError(503, 'MINIAPP_WECHAT_UNAVAILABLE', '微信登录服务暂不可用');

export const miniappWechatCodeInvalid = () =>
  new ApiError(401, 'MINIAPP_WECHAT_CODE_INVALID', '微信登录凭证已失效，请重试');
