import { Controller } from 'egg';

export default class MobileScanController extends Controller {
  public async createTicket() {
    this.ctx.body = {
      success: true,
      data: await this.ctx.service.mobileScan.createTicket(),
    };
  }

  public async login() {
    const { ticket } = this.ctx.request.body as any;
    await this.ctx.service.mobileScan.login(ticket);
    this.ctx.body = { success: true, data: null };
  }
}
