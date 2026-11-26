import { Context } from 'egg';
import { ApiError } from '../lib/errors';

export default function errorHandler(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(500, 'INTERNAL_ERROR', '系统异常');

      if (!(err instanceof ApiError)) {
        ctx.logger.error('[api] %s %s', ctx.method, ctx.url, err);
      }

      ctx.status = apiError.status;
      ctx.set('Content-Type', 'application/json; charset=utf-8');
      ctx.body = {
        success: false,
        errorCode: apiError.errorCode,
        errorMessage: apiError.message,
      };
    }
  };
}
