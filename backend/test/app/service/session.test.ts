import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { sqlNow, sqlNowPlusHours } from '../../../app/lib/time';
import { resetDb } from '../../support/db';
import { createUser } from '../../support/factory';

describe('service/session', () => {
  beforeEach(async () => {
    await resetDb(app);
  });

  it('removes only expired sessions', async () => {
    const user = await createUser(app);
    const now = sqlNow();
    await app.knex('sessions').insert([
      {
        token_hash: 'expired-token',
        user_id: user.id,
        expires_at: sqlNowPlusHours(-1),
        last_seen_at: now,
        created_at: now,
      },
      {
        token_hash: 'valid-token',
        user_id: user.id,
        expires_at: sqlNowPlusHours(1),
        last_seen_at: now,
        created_at: now,
      },
    ]);

    const deleted = await app.mockContext().service.session.destroyExpired();

    assert.strictEqual(deleted, 1);
    const rows = await app.knex('sessions').select('token_hash');
    assert.deepStrictEqual(
      rows.map((row) => row.token_hash),
      ['valid-token'],
    );
  });
});
