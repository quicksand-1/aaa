import { Controller } from 'egg';
import { validationError } from '../lib/errors';

export default class AuthController extends Controller {
  public async login() {
    const { account, password } = this.ctx.request.body as any;
    if (!account || !password) {
      throw validationError('请输入账号和密码');
    }

    const result = await this.ctx.service.auth.login(
      String(account),
      String(password),
    );

    this.ctx.body = { success: true, data: result };
  }

  public async logout() {
    await this.ctx.service.auth.logout();
    this.ctx.body = { success: true, data: null };
  }

  public async info() {
    this.ctx.body = {
      success: true,
      data: this.ctx.service.auth.currentUserInfo(),
    };
  }

  public async changePassword() {
    const { oldPwd, newPwd, rePwd } = this.ctx.request.body as any;
    await this.ctx.service.auth.changePassword(
      String(oldPwd || ''),
      String(newPwd || ''),
      String(rePwd || ''),
    );
    this.ctx.body = { success: true, data: null };
  }
}
