const auth = require('http-auth');
const statusMonitor = require('express-status-monitor');

module.exports = (app) => {
  const basic = auth.basic({ realm: 'Monitor Area' }, (user, pass, authcallback) => {
    authcallback(user === 'user' && pass === 'password');
  });

  app.get('/status', auth.connect(basic), statusMonitor());

  app.use(statusMonitor());
};
