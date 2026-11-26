import { Subscription } from 'egg';

export default class MarketRefresh extends Subscription {
  static get schedule() {
    return {
      interval: '5m',
      type: 'worker',
      immediate: true,
    };
  }

  public async subscribe() {
    // 单测环境不联网，刷新逻辑由 lib/market 单测覆盖
    if (this.app.config.env === 'unittest') return;
    await this.ctx.service.market.refresh();
  }
}
