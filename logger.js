const snaplog = require('snaplog');
const chalk = require('chalk');
const ip = require('ip');

const divider = chalk.gray('\n-----------------------------------');


const logger = {
  error: (err) => {
    snaplog.error(err);
  },

  warn: (msg) => {
    snaplog.warn(msg);
  },

  emergency: (msg) => {
    snaplog.emergency(msg);
  },

  success: (msg) => {
    snaplog.success(msg);
  },

  info: (msg) => {
    snaplog.info(msg);
  },

  progress: (title) => {
    const progress = snaplog.progress({ title, steps: 10 });

    this.nextCall = (message) => {
      progress.next({ description: message });
    };

    return this;
  },

  // Called when express.js app starts on given port w/o errors
  appStarted: (port, tunnelStarted) => {
    console.log(chalk.green('Server started ✓'));

    // If the tunnel started, log that and the URL it's available at
    if (tunnelStarted) {
      console.log(`Tunnel initialised ${chalk.green('✓')}`);
    }

    console.log(`
${chalk.bold('Access URLs:')}${divider}
Localhost: ${chalk.magenta(`http://localhost:${port}`)}
      LAN: ${chalk.magenta(`http://${ip.address()}:${port}`) +
(tunnelStarted ? `\n    Proxy: ${chalk.magenta(tunnelStarted)}` : '')}${divider}
${chalk.blue(`Press ${chalk.italic('CTRL-C')} to stop`)}
    `);
  },
};

module.exports = logger;
