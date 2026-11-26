import { Subscription } from 'egg';

export default class CleanupSessions extends Subscription {
  static get schedule() {
    return {
      interval: '1h',
      type: 'worker',
      immediate: false,
    };
  }

  public async subscribe() {
    const [deletedSessions, deletedTickets] = await Promise.all([
      this.ctx.service.session.destroyExpired(),
      this.ctx.service.mobileScan.destroyExpired(),
    ]);
    if (deletedSessions > 0) {
      this.app.logger.info('[session] 清理过期会话 %d 条', deletedSessions);
    }
    if (deletedTickets > 0) {
      this.app.logger.info(
        '[mobile-scan] 清理过期扫码票据 %d 条',
        deletedTickets,
      );
    }
  }
}
