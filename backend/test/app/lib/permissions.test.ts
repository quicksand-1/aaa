import assert from 'assert';
import {
  adminPermissions,
  emptyPermissions,
  hasPermission,
  toAuthFunctionList,
} from '../../../app/lib/permissions';

describe('app/lib/permissions', () => {
  it('starts with no registered business modules', () => {
    assert.deepStrictEqual(adminPermissions(), {});
    assert.deepStrictEqual(emptyPermissions(), {});
  });

  it('allows administrators to access any registered module', () => {
    const user = {
      isAdmin: true,
      permissions: emptyPermissions(),
    };

    assert.strictEqual(hasPermission(user, 'demo', 'read'), true);
    assert.strictEqual(hasPermission(user, 'demo', 'edit'), true);
  });

  it('only exposes the admin access code before modules are registered', () => {
    assert.deepStrictEqual(toAuthFunctionList(emptyPermissions(), false), []);
    assert.deepStrictEqual(toAuthFunctionList(emptyPermissions(), true), [
      'admin',
    ]);
  });
});
