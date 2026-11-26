import assert from 'assert';
import errorHandler from '../../../app/middleware/error-handler';
import { ApiError, validationError } from '../../../app/lib/errors';

function createCtx() {
  const ctx: any = {
    method: 'POST',
    url: '/api/test.json',
    status: 404,
    body: undefined,
    headers: {} as Record<string, string>,
    logger: {
      errors: [] as any[],
      error(...args: any[]) {
        this.errors.push(args);
      },
    },
    set(name: string, value: string) {
      ctx.headers[name] = value;
    },
  };
  return ctx;
}

describe('middleware/error-handler', () => {
  it('returns the frontend error envelope for ApiError', async () => {
    const ctx = createCtx();

    await errorHandler()(ctx, async () => {
      throw validationError('名称不能为空');
    });

    assert.strictEqual(ctx.status, 400);
    assert.strictEqual(
      ctx.headers['Content-Type'],
      'application/json; charset=utf-8',
    );
    assert.deepStrictEqual(ctx.body, {
      success: false,
      errorCode: 'VALIDATION_ERROR',
      errorMessage: '名称不能为空',
    });
    assert.strictEqual(ctx.logger.errors.length, 0);
  });

  it('hides internal error details but logs them', async () => {
    const ctx = createCtx();

    await errorHandler()(ctx, async () => {
      throw new Error('database is locked');
    });

    assert.strictEqual(ctx.status, 500);
    assert.deepStrictEqual(ctx.body, {
      success: false,
      errorCode: 'INTERNAL_ERROR',
      errorMessage: '系统异常',
    });
    assert.strictEqual(ctx.logger.errors.length, 1);
  });

  it('keeps ApiError status and code', async () => {
    const ctx = createCtx();

    await errorHandler()(ctx, async () => {
      throw new ApiError(401, 'UNLOGIN', '请先登录');
    });

    assert.strictEqual(ctx.status, 401);
    assert.strictEqual(ctx.body.errorCode, 'UNLOGIN');
    assert.strictEqual(ctx.body.errorMessage, '请先登录');
  });
});
