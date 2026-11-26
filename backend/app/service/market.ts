import { Service } from 'egg';
import { getOverview, refreshMarket } from '../lib/market';

export default class MarketService extends Service {
  public async overview() {
    return getOverview(this.app.knex);
  }

  public async refresh() {
    return refreshMarket({
      knex: this.app.knex,
      logger: this.app.logger,
    });
  }
}
