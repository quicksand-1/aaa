import { Context } from 'egg';
import { deny, unlogin } from '../lib/errors';

export default function requireAdmin() {
  return async (ctx: Context, next: () => Promise<any>) => {
    const user = ctx.state.currentUser;
    if (!user) throw unlogin();
    if (!user.isAdmin) throw deny('只有管理员可以执行该操作');
    await next();
  };
}
