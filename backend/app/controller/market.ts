import { Controller } from 'egg';

export default class MarketController extends Controller {
  public async overview() {
    const data = await this.ctx.service.market.overview();
    this.ctx.body = { success: true, data };
  }
}
