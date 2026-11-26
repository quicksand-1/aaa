import { Service } from 'egg';
import {
  conflict,
  loginFailed,
  loginLocked,
  unlogin,
  validationError,
} from '../lib/errors';
import {
  isPasswordValid,
  hashPassword,
  verifyDummyPassword,
  verifyPassword,
  PASSWORD_MESSAGE,
} from '../lib/password';
import { isMiniProgramRequest } from '../lib/client-type';
import { toAuthFunctionList } from '../lib/permissions';
import { sqlNow } from '../lib/time';
import type { AuthUser } from '../lib/types';
import { getSessionToken } from '../lib/auth-cookie';

export default class AuthService extends Service {
  public async login(
    account: string,
    password: string,
  ): Promise<{ needModifiedPwd: boolean; sessionToken?: string }> {
    const username = String(account || '').trim();
    const knex = this.app.knex;
    const user = await knex('users').where({ username }).first();

    if (!user) {
      await verifyDummyPassword(String(password || ''));
      throw loginFailed();
    }

    const locked = await knex('users')
      .where({ id: user.id })
      .where('locked_until', '>', sqlNow())
      .first('id');
    if (locked) {
      throw loginLocked(this.app.config.auth.lockMinutes);
    }

    if (!user.status) {
      await verifyDummyPassword(String(password || ''));
      throw loginFailed();
    }

    const passwordOk = await verifyPassword(
      user.password_hash,
      String(password || ''),
    );

    if (!passwordOk) {
      const attempts = Number(user.failed_attempts || 0) + 1;
      if (attempts >= this.app.config.auth.maxFailedAttempts) {
        await knex('users')
          .where({ id: user.id })
          .update({
            failed_attempts: 0,
            locked_until: sqlNow(this.app.config.auth.lockMinutes),
            updated_at: sqlNow(),
          });
        throw loginLocked(this.app.config.auth.lockMinutes);
      }

      await knex('users').where({ id: user.id }).update({
        failed_attempts: attempts,
        updated_at: sqlNow(),
      });
      throw loginFailed();
    }

    await knex('users').where({ id: user.id }).update({
      failed_attempts: 0,
      locked_until: null,
      last_login_at: sqlNow(),
      updated_at: sqlNow(),
    });

    const session = await this.ctx.service.session.create(
      Number(user.id),
      this.ctx,
    );

    return {
      needModifiedPwd: !!user.need_modified_pwd,
      sessionToken: isMiniProgramRequest(this.ctx) ? session.token : undefined,
    };
  }

  public async logout(): Promise<void> {
    const token = getSessionToken(this.ctx);
    if (token) {
      await this.ctx.service.session.destroyByToken(token);
    }
    this.ctx.cookies.set(this.app.config.auth.cookieName, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false,
      signed: false,
      maxAge: 0,
      overwrite: true,
    });
  }

  public currentUserInfo(): AuthUser & { authFunctionList: string[] } {
    const user = this.ctx.state.currentUser;
    if (!user) throw unlogin();

    return {
      ...user,
      authFunctionList: toAuthFunctionList(user.permissions, user.isAdmin),
    };
  }

  public async changePassword(
    oldPwd: string,
    newPwd: string,
    rePwd: string,
  ): Promise<void> {
    const user = this.ctx.state.currentUser;
    if (!user) throw unlogin();

    if (newPwd !== rePwd) {
      throw validationError('两次输入的新密码不一致');
    }
    if (!isPasswordValid(newPwd)) {
      throw validationError(PASSWORD_MESSAGE);
    }
    if (oldPwd === newPwd) {
      throw validationError('新密码不能与原密码相同');
    }

    const row = await this.app
      .knex('users')
      .where({ id: user.id })
      .first('password_hash');
    if (!row) throw unlogin();

    const oldOk = await verifyPassword(row.password_hash, String(oldPwd || ''));
    if (!oldOk) {
      throw validationError('原密码错误');
    }

    await this.app
      .knex('users')
      .where({ id: user.id })
      .update({
        password_hash: await hashPassword(newPwd),
        need_modified_pwd: 0,
        password_changed_at: sqlNow(),
        failed_attempts: 0,
        locked_until: null,
        updated_at: sqlNow(),
      });

    await this.ctx.service.session.destroyAllForUser(
      user.id,
      this.ctx.state.sessionId,
    );
  }

  public async resetPasswordByAdmin(
    userId: number,
    password: string,
  ): Promise<void> {
    if (!isPasswordValid(password)) {
      throw validationError(PASSWORD_MESSAGE);
    }

    const updated = await this.app
      .knex('users')
      .where({ id: userId })
      .update({
        password_hash: await hashPassword(password),
        need_modified_pwd: 1,
        password_changed_at: sqlNow(),
        failed_attempts: 0,
        locked_until: null,
        updated_at: sqlNow(),
      });

    if (!updated) {
      throw conflict('账号不存在');
    }

    await this.ctx.service.session.destroyAllForUser(userId);
  }
}
