import { Service } from 'egg';
import {
  miniappIdentityConflict,
  miniappIdentityDisabled,
  miniappWechatCodeInvalid,
  unlogin,
} from '../lib/errors';
import { sqlNow } from '../lib/time';

const WECHAT_PROVIDER = 'wechat_miniapp';

export type MiniappLoginResult =
  | { bound: false }
  | {
      bound: true;
      sessionToken: string;
      needModifiedPwd: boolean;
    };

function readCode(value: unknown): string {
  const code = String(value || '').trim();
  if (!code) throw miniappWechatCodeInvalid();
  return code;
}

export default class MiniappIdentityService extends Service {
  public async login(codeValue: unknown): Promise<MiniappLoginResult> {
    const code = readCode(codeValue);
    const { openid, unionid } = await this.ctx.service.wechat.exchangeCode(code);
    const appId = this.app.config.wechatMiniapp.appId;

    return this.app.knex.transaction(async (trx) => {
      const identity = await trx('user_identities')
        .where({
          provider: WECHAT_PROVIDER,
          app_id: appId,
          openid,
        })
        .first();
      if (!identity) return { bound: false };
      if (!identity.status) throw miniappIdentityDisabled();

      const user = await trx('users')
        .where({ id: identity.user_id, status: 1 })
        .first();
      if (!user) throw miniappIdentityDisabled();

      const now = sqlNow();
      await trx('user_identities').where({ id: identity.id }).update({
        unionid: unionid || identity.unionid || null,
        last_login_at: now,
        updated_at: now,
      });
      await trx('users').where({ id: user.id }).update({
        last_login_at: now,
        updated_at: now,
      });

      const session = await this.ctx.service.session.create(
        Number(user.id),
        this.ctx,
        trx,
        { setCookie: false },
      );

      return {
        bound: true,
        sessionToken: session.token,
        needModifiedPwd: !!user.need_modified_pwd,
      };
    });
  }

  public async bind(codeValue: unknown): Promise<void> {
    const currentUser = this.ctx.state.currentUser;
    if (!currentUser) throw unlogin();

    const code = readCode(codeValue);
    const { openid, unionid } = await this.ctx.service.wechat.exchangeCode(code);
    const appId = this.app.config.wechatMiniapp.appId;

    await this.app.knex.transaction(async (trx) => {
      const identity = await trx('user_identities')
        .where({
          provider: WECHAT_PROVIDER,
          app_id: appId,
          openid,
        })
        .first();
      if (
        identity &&
        Number(identity.user_id) !== Number(currentUser.id)
      ) {
        throw miniappIdentityConflict();
      }
      if (identity && !identity.status) {
        throw miniappIdentityDisabled();
      }

      const now = sqlNow();
      if (identity) {
        await trx('user_identities').where({ id: identity.id }).update({
          unionid: unionid || identity.unionid || null,
          last_login_at: now,
          updated_at: now,
        });
        return;
      }

      await trx('user_identities').insert({
        user_id: currentUser.id,
        provider: WECHAT_PROVIDER,
        app_id: appId,
        openid,
        unionid: unionid || null,
        status: 1,
        last_login_at: now,
        created_at: now,
        updated_at: now,
      });
    });
  }

  public async getBinding(): Promise<{ bound: boolean }> {
    const currentUser = this.ctx.state.currentUser;
    if (!currentUser) throw unlogin();

    const identity = await this.app
      .knex('user_identities')
      .where({
        user_id: currentUser.id,
        provider: WECHAT_PROVIDER,
        app_id: this.app.config.wechatMiniapp.appId,
        status: 1,
      })
      .first('id');

    return { bound: !!identity };
  }

  public async unbind(): Promise<void> {
    const currentUser = this.ctx.state.currentUser;
    if (!currentUser) throw unlogin();

    await this.app
      .knex('user_identities')
      .where({
        user_id: currentUser.id,
        provider: WECHAT_PROVIDER,
        app_id: this.app.config.wechatMiniapp.appId,
      })
      .del();
  }
}
