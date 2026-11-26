import type { Knex } from 'knex';
import type {
  AuthUser,
  ModuleKey,
  ModulePermissions,
  PermissionAction,
} from './types';

// 新业务模块在此登记后，账户管理中的模块权限与路由鉴权即可复用。
export const PERMISSION_MODULES: ModuleKey[] = [];

export const PERMISSION_ACTIONS: PermissionAction[] = [
  'read',
  'edit',
  'download',
];

export function emptyPermissions(): ModulePermissions {
  return PERMISSION_MODULES.reduce((result, module) => {
    result[module] = { read: false, edit: false, download: false };
    return result;
  }, {} as ModulePermissions);
}

export function adminPermissions(): ModulePermissions {
  return PERMISSION_MODULES.reduce((result, module) => {
    result[module] = { read: true, edit: true, download: true };
    return result;
  }, {} as ModulePermissions);
}

export function hasPermission(
  user: Pick<AuthUser, 'isAdmin' | 'permissions'>,
  module: ModuleKey,
  action: PermissionAction,
): boolean {
  if (user.isAdmin) return true;
  return user.permissions?.[module]?.[action] === true;
}

export async function loadUserPermissions(
  knex: Knex,
  userId: number,
  isAdmin: boolean,
): Promise<ModulePermissions> {
  if (isAdmin) return adminPermissions();

  const permissions = emptyPermissions();
  const rows = await knex('user_permissions')
    .where({ user_id: userId })
    .select('module', 'can_read', 'can_edit', 'can_download');

  for (const row of rows) {
    const module = row.module as ModuleKey;
    if (!permissions[module]) continue;
    permissions[module] = {
      read: !!row.can_read,
      edit: !!row.can_edit,
      download: !!row.can_download,
    };
  }

  return permissions;
}

export function toAuthFunctionList(
  permissions: ModulePermissions,
  isAdmin: boolean,
): string[] {
  const result: string[] = [];
  if (isAdmin) result.push('admin');

  for (const module of PERMISSION_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      if (permissions[module][action]) {
        result.push(`${module}:${action}`);
      }
    }
  }

  return result;
}
