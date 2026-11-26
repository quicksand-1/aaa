import { Application, IBoot } from 'egg';
import { createDb } from './app/lib/db';

export default class AppBoot implements IBoot {
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  configDidLoad() {
    this.app.knex = createDb(this.app);
  }

  async beforeClose() {
    await this.app.knex.destroy();
  }
}
