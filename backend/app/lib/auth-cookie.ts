import { Context } from 'egg';

export function setSessionCookie(
  ctx: Context,
  token: string,
  maxAgeMs: number,
): void {
  ctx.cookies.set(ctx.app.config.auth.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
    signed: false,
    overwrite: true,
    maxAge: maxAgeMs,
  });
}

export function clearSessionCookie(ctx: Context): void {
  ctx.cookies.set(ctx.app.config.auth.cookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
    signed: false,
    overwrite: true,
    maxAge: 0,
  });
}

export function getSessionToken(ctx: Context): string {
  const authorization = ctx.get('authorization').trim();
  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme.toLowerCase() === 'bearer' && token) return token;

  return ctx.cookies.get(ctx.app.config.auth.cookieName, { signed: false }) || '';
}
