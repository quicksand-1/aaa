import { Application } from 'egg';

export default (app: Application) => {
  const { router, controller } = app;
  const auth = (app.middleware as any).auth();
  const requireAdmin = (app.middleware as any).requireAdmin();

  router.get('/api/health', controller.health.index);
  router.post('/api/login.json', controller.auth.login);
  router.get('/api/logout.json', controller.auth.logout);
  router.get('/api/system/user/info.json', auth, controller.auth.info);
  router.post(
    '/api/system/user/changePwd.json',
    auth,
    controller.auth.changePassword,
  );
  router.post(
    '/api/mobile/session-ticket.json',
    auth,
    controller.mobileScan.createTicket,
  );
  router.post('/api/mobile/login.json', controller.mobileScan.login);
  router.post('/api/miniapp/login.json', controller.miniappIdentity.login);
  router.post(
    '/api/miniapp/bind.json',
    auth,
    controller.miniappIdentity.bind,
  );
  router.get(
    '/api/miniapp/binding.json',
    auth,
    controller.miniappIdentity.getBinding,
  );
  router.delete(
    '/api/miniapp/binding.json',
    auth,
    controller.miniappIdentity.unbind,
  );

  router.get('/api/users', auth, requireAdmin, controller.users.list);
  router.post('/api/users', auth, requireAdmin, controller.users.create);
  router.put('/api/users/:id', auth, requireAdmin, controller.users.update);
  router.put(
    '/api/users/:id/password',
    auth,
    requireAdmin,
    controller.users.resetPassword,
  );
  router.put(
    '/api/users/:id/status',
    auth,
    requireAdmin,
    controller.users.setStatus,
  );
  router.delete('/api/users/:id', auth, requireAdmin, controller.users.remove);
};
