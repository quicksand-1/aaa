import { Service } from 'egg';
import { conflict, notFound, validationError } from '../lib/errors';
import {
  adminPermissions,
  emptyPermissions,
  PERMISSION_MODULES,
} from '../lib/permissions';
import {
  isPasswordValid,
  hashPassword,
  PASSWORD_MESSAGE,
} from '../lib/password';
import { sqlNow } from '../lib/time';
import type { ModuleKey, ModulePermissions } from '../lib/types';

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
const ROLE_NAMES = ['管理员', '编辑员', '查看员', '自定义'];

interface UserInput {
  username?: string;
  name?: string;
  password?: string;
  role?: string;
  isAdmin?: boolean;
  status?: boolean;
  permissions?: Partial<ModulePermissions>;
}

function rolePermissions(role: string): ModulePermissions {
  if (role === '管理员') return adminPermissions();

  const permissions = emptyPermissions();
  if (role === '编辑员') {
    for (const module of PERMISSION_MODULES) {
      permissions[module].read = true;
      permissions[module].edit = true;
    }
  } else if (role === '查看员') {
    for (const module of PERMISSION_MODULES) {
      permissions[module].read = true;
    }
  }
  return permissions;
}

function normalizePermissions(
  input: UserInput['permissions'],
  role: string,
  isAdmin: boolean,
): ModulePermissions {
  if (isAdmin || role === '管理员') return adminPermissions();

  const permissions = rolePermissions(role);
  if (!input) return permissions;

  for (const module of PERMISSION_MODULES) {
    const value = input[module];
    if (!value) continue;
    permissions[module] = {
      read: !!value.read,
      edit: !!value.edit,
      download: !!value.download,
    };
  }
  return permissions;
}

export default class UsersService extends Service {
  public async list() {
    const users = await this.app
      .knex('users')
      .select(
        'id',
        'username',
        'name',
        'role',
        'is_admin',
        'status',
        'need_modified_pwd',
        'last_login_at',
        'created_at',
      )
      .orderBy('id', 'asc');

    const rows = await this.app
      .knex('user_permissions')
      .select('user_id', 'module', 'can_read', 'can_edit', 'can_download');

    const permissionMap = new Map<number, ModulePermissions>();
    for (const row of rows) {
      const userId = Number(row.user_id);
      if (!permissionMap.has(userId)) {
        permissionMap.set(userId, emptyPermissions());
      }
      const permissions = permissionMap.get(userId)!;
      const module = row.module as ModuleKey;
      if (permissions[module]) {
        permissions[module] = {
          read: !!row.can_read,
          edit: !!row.can_edit,
          download: !!row.can_download,
        };
      }
    }

    return users.map((user) => {
      const id = Number(user.id);
      return {
        id,
        username: user.username,
        name: user.name,
        role: user.role,
        isAdmin: !!user.is_admin,
        status: !!user.status,
        needModifiedPwd: !!user.need_modified_pwd,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        permissions: user.is_admin
          ? adminPermissions()
          : permissionMap.get(id) || emptyPermissions(),
      };
    });
  }

  public async create(input: UserInput) {
    const username = String(input.username || '').trim();
    const name = String(input.name || '').trim();
    const role = String(input.role || '查看员');
    const isAdmin = !!input.isAdmin || role === '管理员';

    if (!USERNAME_PATTERN.test(username)) {
      throw validationError('用户名只能包含英文、数字、下划线，长度 3-30 位');
    }
    if (!name || name.length > 50) {
      throw validationError('姓名不能为空且不超过 50 个字符');
    }
    if (!ROLE_NAMES.includes(role)) {
      throw validationError('角色不合法');
    }
    if (!isPasswordValid(input.password)) {
      throw validationError(PASSWORD_MESSAGE);
    }

    const exists = await this.app.knex('users').where({ username }).first('id');
    if (exists) throw conflict('用户名已存在');

    const permissions = normalizePermissions(input.permissions, role, isAdmin);

    const id = await this.app.knex.transaction(async (trx) => {
      const now = sqlNow();
      const [userId] = await trx('users').insert({
        username,
        name,
        password_hash: await hashPassword(String(input.password)),
        role,
        is_admin: isAdmin ? 1 : 0,
        status: input.status === false ? 0 : 1,
        need_modified_pwd: 1,
        created_at: now,
        updated_at: now,
      });

      const rows = PERMISSION_MODULES.map((module) => ({
        user_id: userId,
        module,
        can_read: permissions[module].read ? 1 : 0,
        can_edit: permissions[module].edit ? 1 : 0,
        can_download: permissions[module].download ? 1 : 0,
        created_at: now,
        updated_at: now,
      }));
      if (rows.length > 0) {
        await trx('user_permissions').insert(rows);
      }
      return Number(userId);
    });

    return this.get(id);
  }

  public async update(id: number, input: UserInput) {
    const user = await this.getRow(id);
    const role = input.role ?? user.role;
    let isAdmin = input.isAdmin ?? !!user.is_admin;
    if (input.isAdmin === undefined) {
      if (role === '管理员') {
        isAdmin = true;
      } else if (input.role !== undefined) {
        isAdmin = false;
      }
    }
    const status = input.status ?? !!user.status;

    if (!ROLE_NAMES.includes(role)) throw validationError('角色不合法');
    if (input.username !== undefined) {
      const username = String(input.username).trim();
      if (username !== user.username) {
        throw validationError('登录账号不可修改');
      }
    }
    if (input.name !== undefined) {
      const name = String(input.name).trim();
      if (!name || name.length > 50) {
        throw validationError('姓名不能为空且不超过 50 个字符');
      }
    }

    await this.app.knex.transaction(async (trx) => {
      if (!!user.is_admin && !isAdmin) {
        await this.assertOtherAdminExists(trx, id, '不能降级最后一个管理员');
      }
      if (!!user.status && !status) {
        await this.assertOtherActiveAdminExists(trx, id);
      }

      await trx('users')
        .where({ id })
        .update({
          name:
            input.name !== undefined ? String(input.name).trim() : user.name,
          role,
          is_admin: isAdmin ? 1 : 0,
          status: status ? 1 : 0,
          updated_at: sqlNow(),
        });

      // 只改姓名/状态时保留原有自定义权限，避免把权限默默重置成角色默认值
      const permissionsChanged =
        input.permissions !== undefined ||
        (input.role !== undefined && role !== user.role) ||
        (input.isAdmin !== undefined && isAdmin !== !!user.is_admin);
      if (permissionsChanged) {
        const permissions = normalizePermissions(
          input.permissions,
          role,
          isAdmin,
        );
        const permissionNow = sqlNow();
        await trx('user_permissions').where({ user_id: id }).del();
        const rows = PERMISSION_MODULES.map((module) => ({
          user_id: id,
          module,
          can_read: permissions[module].read ? 1 : 0,
          can_edit: permissions[module].edit ? 1 : 0,
          can_download: permissions[module].download ? 1 : 0,
          created_at: permissionNow,
          updated_at: permissionNow,
        }));
        if (rows.length > 0) {
          await trx('user_permissions').insert(rows);
        }
      }
    });

    if (!status) {
      await this.ctx.service.session.destroyAllForUser(id);
    }

    return this.get(id);
  }

  public async resetPassword(id: number, password: string) {
    await this.getRow(id);
    await this.ctx.service.auth.resetPasswordByAdmin(
      id,
      String(password || ''),
    );
    return this.get(id);
  }

  public async setStatus(id: number, status: boolean) {
    const user = await this.getRow(id);
    if (!status && !!user.is_admin) {
      await this.assertOtherActiveAdminExists(this.app.knex, id);
    }

    await this.app
      .knex('users')
      .where({ id })
      .update({
        status: status ? 1 : 0,
        updated_at: sqlNow(),
      });
    if (!status) {
      await this.ctx.service.session.destroyAllForUser(id);
    } else {
      await this.app.knex('users').where({ id }).update({
        failed_attempts: 0,
        locked_until: null,
      });
    }

    return this.get(id);
  }

  public async remove(id: number) {
    const current = this.ctx.state.currentUser;
    if (!current) throw validationError('请先登录');
    if (current.id === id) throw conflict('不能删除当前登录账号');

    const user = await this.getRow(id);
    if (!!user.is_admin) {
      await this.assertOtherAdminExists(
        this.app.knex,
        id,
        '不能删除最后一个管理员',
      );
    }

    await this.app.knex('users').where({ id }).del();
    return { id };
  }

  private async getRow(id: number) {
    const user = await this.app.knex('users').where({ id }).first();
    if (!user) throw notFound('账号不存在');
    return user;
  }

  private async get(id: number) {
    const list = await this.list();
    const user = list.find((item) => item.id === id);
    if (!user) throw notFound('账号不存在');
    return user;
  }

  private async assertOtherAdminExists(
    knex: any,
    excludeId: number,
    message: string,
  ) {
    const other = await knex('users')
      .where({ is_admin: 1 })
      .whereNot({ id: excludeId })
      .first('id');
    if (!other) throw conflict(message);
  }

  private async assertOtherActiveAdminExists(knex: any, excludeId: number) {
    const other = await knex('users')
      .where({ is_admin: 1, status: 1 })
      .whereNot({ id: excludeId })
      .first('id');
    if (!other) throw conflict('不能停用最后一个管理员');
  }
}
