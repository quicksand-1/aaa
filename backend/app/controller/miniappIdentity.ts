import { Controller } from 'egg';

export default class MiniappIdentityController extends Controller {
  public async login() {
    const { code } = this.ctx.request.body as any;
    this.ctx.body = {
      success: true,
      data: await this.ctx.service.miniappIdentity.login(code),
    };
  }

  public async bind() {
    const { code } = this.ctx.request.body as any;
    await this.ctx.service.miniappIdentity.bind(code);
    this.ctx.body = { success: true, data: null };
  }

  public async getBinding() {
    this.ctx.body = {
      success: true,
      data: await this.ctx.service.miniappIdentity.getBinding(),
    };
  }

  public async unbind() {
    await this.ctx.service.miniappIdentity.unbind();
    this.ctx.body = { success: true, data: null };
  }
}
