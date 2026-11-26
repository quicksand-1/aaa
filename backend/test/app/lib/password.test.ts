import assert from 'assert';
import {
  hashPassword,
  isPasswordValid,
  verifyPassword,
} from '../../../app/lib/password';

describe('app/lib/password', () => {
  it('hashes and verifies with argon2id', async () => {
    const hashed = await hashPassword('Abc123!@#xyz');

    assert.match(hashed, /^\$argon2id\$/);
    assert.notStrictEqual(hashed, 'Abc123!@#xyz');
    assert.strictEqual(await verifyPassword(hashed, 'Abc123!@#xyz'), true);
    assert.strictEqual(await verifyPassword(hashed, 'wrong'), false);
  });

  it('validates password policy', () => {
    assert.strictEqual(isPasswordValid('Abc123!@#xyz'), true);
    assert.strictEqual(isPasswordValid('Abc123!@#xy'), false);
    assert.strictEqual(isPasswordValid('Abc123!@#xyz1234567'), false);
    assert.strictEqual(isPasswordValid('abcdef!@#xyz'), false);
    assert.strictEqual(isPasswordValid('ABCDEF!@#XYZ'), false);
    assert.strictEqual(isPasswordValid('Abcdefghijkl'), false);
  });
});
