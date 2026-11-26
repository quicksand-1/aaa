import { Context } from 'egg';

export const MINIAPP_CLIENT_TYPE = 'miniapp';

export function isMiniProgramRequest(ctx: Context): boolean {
  return ctx.get('x-client-type') === MINIAPP_CLIENT_TYPE;
}
