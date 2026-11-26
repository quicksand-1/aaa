import crypto from 'crypto';
import os from 'os';
import { Context, Service } from 'egg';
import { ApiError, unlogin } from '../lib/errors';
import { sqlNow } from '../lib/time';

const TICKET_TTL_SECONDS = 120;
const MOBILE_WEB_PURPOSE = 'mobile_web';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function invalidTicket(): ApiError {
  return new ApiError(401, 'MOBILE_TICKET_INVALID', '二维码已失效，请重新生成');
}

function getLanIpv4(): string {
  const interfaces = Object.values(os.networkInterfaces()).flat();
  return (
    interfaces.find(
      (item) =>
        item &&
        item.family === 'IPv4' &&
        !item.internal &&
        !item.address.startsWith('169.254.'),
    )?.address || ''
  );
}

function resolveMobileBaseUrl(ctx: Context, configuredBaseUrl: string): string {
  const source = configuredBaseUrl || ctx.get('origin') || ctx.get('referer');
  if (!source) return '';

  try {
    const url = new URL(source);
    if (configuredBaseUrl) return url.origin;

    if (['localhost', '127.0.0.1'].includes(url.hostname)) {
      const lanIp = getLanIpv4();
      if (lanIp) url.hostname = lanIp;
    }
    return url.origin;
  } catch {
    return '';
  }
}

export default class MobileScanService extends Service {
  public async createTicket(): Promise<{
    ticket: string;
    expiresInSeconds: number;
    baseUrl: string;
  }> {
    const user = this.ctx.state.currentUser;
    if (!user) throw unlogin();

    const ticket = crypto.randomBytes(32).toString('base64url');
    const now = sqlNow();
    const expiresAt = sqlNow(TICKET_TTL_SECONDS / 60);

    await this.app.knex.transaction(async (trx) => {
      // 新二维码生效后，旧二维码立即作废，避免同一账号存在多个有效票据。
      await trx('mobile_login_tickets')
        .where({ user_id: user.id })
        .where({ purpose: MOBILE_WEB_PURPOSE })
        .whereNull('consumed_at')
        .update({ consumed_at: now });
      await trx('mobile_login_tickets').insert({
        token_hash: hashToken(ticket),
        user_id: user.id,
        purpose: MOBILE_WEB_PURPOSE,
        issuer_session_id: this.ctx.state.sessionId || null,
        expires_at: expiresAt,
        ip: this.ctx.ip || null,
        user_agent: (this.ctx.get('user-agent') || '').slice(0, 255) || null,
        created_at: now,
      });
    });

    return {
      ticket,
      expiresInSeconds: TICKET_TTL_SECONDS,
      baseUrl: resolveMobileBaseUrl(
        this.ctx,
        this.app.config.mobileScan.baseUrl,
      ),
    };
  }

  public async login(ticketValue: unknown): Promise<void> {
    const ticket = String(ticketValue || '').trim();
    if (!ticket) throw invalidTicket();

    const tokenHash = hashToken(ticket);
    const now = sqlNow();
    const user = await this.app.knex.transaction(async (trx) => {
      const row = await trx('mobile_login_tickets')
        .where({ token_hash: tokenHash })
        .where({ purpose: MOBILE_WEB_PURPOSE })
        .whereNull('consumed_at')
        .where('expires_at', '>', now)
        .first();

      if (!row) throw invalidTicket();

      const consumed = await trx('mobile_login_tickets')
        .where({ id: row.id })
        .whereNull('consumed_at')
        .update({ consumed_at: now });
      if (!consumed) throw invalidTicket();

      const userRow = await trx('users')
        .where({ id: row.user_id })
        .where({ status: 1 })
        .first();
      if (!userRow) throw invalidTicket();

      await trx('users').where({ id: row.user_id }).update({
        last_login_at: now,
        updated_at: now,
      });

      return userRow;
    });

    await this.ctx.service.session.create(Number(user.id), this.ctx);
  }

  public async destroyExpired(): Promise<number> {
    return this.app
      .knex('mobile_login_tickets')
      .where('expires_at', '<', sqlNow())
      .del();
  }
}
