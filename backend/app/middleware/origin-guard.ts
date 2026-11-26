import { Context } from 'egg';
import { isMiniProgramRequest } from '../lib/client-type';
import { ApiError } from '../lib/errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export default function originGuard(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    if (SAFE_METHODS.has(ctx.method.toUpperCase())) {
      return next();
    }

    const contentType = ctx.get('content-type') || '';
    const requiresJsonBody = ['POST', 'PUT', 'PATCH'].includes(
      ctx.method.toUpperCase(),
    );
    if (requiresJsonBody && !contentType.includes('application/json')) {
      throw new ApiError(403, 'DENY', '请求格式不正确');
    }

    // 小程序原生请求没有 Origin/Referer，且不共享浏览器 Cookie，使用 Bearer 会话认证。
    if (isMiniProgramRequest(ctx) && ctx.path.startsWith('/api/')) {
      return next();
    }

    const origin = ctx.get('origin') || ctx.get('referer');
    if (!origin) {
      throw new ApiError(403, 'DENY', '非法请求来源');
    }

    let hostname = '';
    try {
      hostname = new URL(origin).hostname;
    } catch {
      throw new ApiError(403, 'DENY', '非法请求来源');
    }

    const allowed = new Set([
      ctx.hostname,
      ...(ctx.app.config.originWhitelist || []),
    ]);

    if (!allowed.has(hostname)) {
      throw new ApiError(403, 'DENY', '非法请求来源');
    }

    await next();
  };
}
