const createStartupState = () => ({ ready: false, failed: false });

const installStartupGate = (app, state) => {
  app.use((req, res, next) => {
    if (req.path === '/api/health/live'
      || req.path === '/api/health/ready'
      || req.path === '/api/health') {
      return next();
    }
    if (state.ready) return next();
    res.set('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Application is starting' });
  });
};

const installHealthRoutes = (app, { checkReadiness, state }) => {
  const live = (_req, res) => {
    res.set('Cache-Control', 'no-store');
    return res.status(200).json({ status: 'alive' });
  };

  const ready = async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!state.ready) {
      return res.status(503).json({
        status: 'not-ready',
        error: 'Dependencies are not ready',
      });
    }
    try {
      const status = await checkReadiness();
      return res.status(200).json({
        status: 'ready',
        migrationVersion: status.currentVersion,
      });
    } catch (error) {
      return res.status(503).json({
        status: 'not-ready',
        error: 'Dependencies are not ready',
      });
    }
  };

  app.get('/api/health/live', live);
  app.get('/api/health/ready', ready);
  app.get('/api/health', ready);
};

const listen = (app, port, host) => new Promise((resolve, reject) => {
  let server;
  const onListening = () => resolve(server);
  try {
    server = host
      ? app.listen(port, host, onListening)
      : app.listen(port, onListening);
    server.once('error', reject);
  } catch (error) {
    reject(error);
  }
});

const close = (server) => new Promise((resolve) => server.close(resolve));

const startApplication = async ({ app, port, host, prepare, state }) => {
  const server = await listen(app, port, host);
  try {
    await prepare();
    state.ready = true;
    return server;
  } catch (error) {
    state.failed = true;
    await close(server);
    throw error;
  }
};

module.exports = {
  createStartupState,
  installHealthRoutes,
  installStartupGate,
  startApplication,
};
