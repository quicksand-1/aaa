import crypto from 'crypto';
import { Context, Service } from 'egg';
import type { Knex } from 'knex';
import { setSessionCookie } from '../lib/auth-cookie';
import { sqlNow, sqlNowPlusHours } from '../lib/time';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export default class SessionService extends Service {
  public async create(
    userId: number,
    ctx: Context,
    trx?: Knex.Transaction,
    options: { setCookie?: boolean } = {},
  ): Promise<{ sessionId: number; token: string }> {
    const { normalHours: hours } = this.app.config.auth;
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = hashToken(token);

    const db = trx || this.app.knex;
    const [sessionId] = await db('sessions').insert({
      token_hash: tokenHash,
      user_id: userId,
      expires_at: sqlNowPlusHours(hours),
      last_seen_at: sqlNow(),
      created_at: sqlNow(),
      ip: ctx.ip || null,
      user_agent: (ctx.get('user-agent') || '').slice(0, 255) || null,
    });

    if (options.setCookie !== false) {
      setSessionCookie(ctx, token, hours * 60 * 60 * 1000);
    }

    return { sessionId: Number(sessionId), token };
  }

  public async destroyByToken(token: string): Promise<void> {
    if (!token) return;
    await this.app
      .knex('sessions')
      .where({ token_hash: hashToken(token) })
      .del();
  }

  public async destroyAllForUser(
    userId: number,
    exceptSessionId?: number,
  ): Promise<void> {
    const query = this.app.knex('sessions').where({ user_id: userId });
    if (exceptSessionId) {
      query.whereNot({ id: exceptSessionId });
    }
    await query.del();
  }

  public async destroyExpired(): Promise<number> {
    return this.app.knex('sessions').where('expires_at', '<', sqlNow()).del();
  }
}
