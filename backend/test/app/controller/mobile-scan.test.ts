import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { sqlNow } from '../../../app/lib/time';
import { resetDb } from '../../support/db';
import {
  ADMIN_PASSWORD,
  cookieOf,
  createUser,
  post,
} from '../../support/factory';

async function loginAsAdmin() {
  const response = await post(app, '/api/login.json')
    .send({ account: 'admin', password: ADMIN_PASSWORD })
    .expect(200);
  return cookieOf(response);
}

describe('mobile scan api', () => {
  beforeEach(async () => {
    await resetDb(app);
  });

  it('creates a one-time ticket and signs the phone in', async () => {
    await createUser(app);
    const desktopCookie = await loginAsAdmin();

    const ticketResponse = await post(app, '/api/mobile/session-ticket.json')
      .set('Cookie', desktopCookie)
      .send({})
      .expect(200);

    const { ticket, expiresInSeconds, baseUrl } = ticketResponse.body.data;
    assert.strictEqual(typeof ticket, 'string');
    assert.strictEqual(expiresInSeconds, 120);
    assert.match(baseUrl, /^http:\/\//);

    const stored = await app.knex('mobile_login_tickets').first('token_hash');
    assert.notStrictEqual(stored.token_hash, ticket);

    const mobileLogin = await post(app, '/api/mobile/login.json')
      .send({ ticket })
      .expect(200);
    const mobileCookie = cookieOf(mobileLogin);

    const info = await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Cookie', mobileCookie)
      .expect(200);
    assert.strictEqual(info.body.data.account, 'admin');

    await post(app, '/api/mobile/login.json').send({ ticket }).expect(401);
  });

  it('invalidates the previous ticket when a new one is generated', async () => {
    await createUser(app);
    const desktopCookie = await loginAsAdmin();

    const first = await post(app, '/api/mobile/session-ticket.json')
      .set('Cookie', desktopCookie)
      .send({})
      .expect(200);
    const second = await post(app, '/api/mobile/session-ticket.json')
      .set('Cookie', desktopCookie)
      .send({})
      .expect(200);

    await post(app, '/api/mobile/login.json')
      .send({ ticket: first.body.data.ticket })
      .expect(401);

    await post(app, '/api/mobile/login.json')
      .send({ ticket: second.body.data.ticket })
      .expect(200);
  });

  it('rejects unauthenticated ticket creation and expired tickets', async () => {
    await post(app, '/api/mobile/session-ticket.json').send({}).expect(401);

    await createUser(app);
    const desktopCookie = await loginAsAdmin();
    const ticketResponse = await post(app, '/api/mobile/session-ticket.json')
      .set('Cookie', desktopCookie)
      .send({})
      .expect(200);

    await app.knex('mobile_login_tickets').update({
      expires_at: sqlNow(-1),
    });

    const expired = await post(app, '/api/mobile/login.json')
      .send({ ticket: ticketResponse.body.data.ticket })
      .expect(401);
    assert.strictEqual(expired.body.errorCode, 'MOBILE_TICKET_INVALID');
  });
});
