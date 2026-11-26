import crypto from 'crypto';
import { Context } from 'egg';
import { clearSessionCookie, getSessionToken } from '../lib/auth-cookie';
import { unlogin } from '../lib/errors';
import { loadUserPermissions } from '../lib/permissions';
import { sqlNow } from '../lib/time';

export default function auth(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const token = getSessionToken(ctx);
    if (!token) throw unlogin();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const knex = ctx.app.knex;

    const row = await knex('sessions as s')
      .join('users as u', 'u.id', 's.user_id')
      .select(
        's.id as session_id',
        'u.id',
        'u.username',
        'u.name',
        'u.role',
        'u.is_admin',
        'u.status',
        'u.need_modified_pwd',
      )
      .where('s.token_hash', tokenHash)
      .where('s.expires_at', '>', sqlNow())
      .first();

    if (!row || !row.status) {
      clearSessionCookie(ctx);
      throw unlogin();
    }

    const permissions = await loadUserPermissions(
      knex,
      Number(row.id),
      !!row.is_admin,
    );

    ctx.state.sessionId = Number(row.session_id);
    ctx.state.currentUser = {
      id: Number(row.id),
      account: row.username,
      name: row.name,
      role: row.role,
      isAdmin: !!row.is_admin,
      needModifiedPwd: !!row.need_modified_pwd,
      permissions,
    };

    await knex('sessions')
      .where({ id: row.session_id })
      .update({ last_seen_at: sqlNow() });

    await next();
  };
}
