import { Context } from 'egg';
import { deny, unlogin } from '../lib/errors';
import { hasPermission } from '../lib/permissions';
import type { ModuleKey, PermissionAction } from '../lib/types';

export default function requirePermission(options: {
  module: ModuleKey;
  action: PermissionAction;
}) {
  return async (ctx: Context, next: () => Promise<any>) => {
    const user = ctx.state.currentUser;
    if (!user) throw unlogin();
    if (!hasPermission(user, options.module, options.action)) {
      throw deny();
    }
    await next();
  };
}
