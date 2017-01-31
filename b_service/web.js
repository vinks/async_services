const express = require('express');
const jsendie = require('jsendie');
const bodyParser = require('body-parser');
const minimist = require('minimist');
const hash = require('object-hash');
const Queue = require('bull');

const logger = require('../logger');
const run = require('./run');
const worker = require('./worker');
const expressStatus = require('./utils/status');
const config = require('./config');


const queue = Queue(config.name);
const argv = minimist(process.argv.slice(2));

const MAX_LISTNERS = config.concurrency * 2;
queue.setMaxListeners(MAX_LISTNERS);

// Redis connection ready
queue.on('ready', () => {
  // Remove all existed jobs
  queue.empty().then(() => {
    // Add listners to queue
    worker(queue);

    // Initialize express server
    const expressApp = (callback) => {
      const app = express();
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(jsendie());

      // Express status
      expressStatus(app);

      const router = express.Router();

      router.get('/', (req, res) => {
        res.success({ message: 'Welcome to microservice api!' });
      });

      router.get('/run/:x/:y', (req, res) => {
        const queryParams = {
          x: req.params.x,
          y: req.params.y
        };

        const jobParams = {
          id: hash.MD5(queryParams),
          data: queryParams
        };

        run(queue, jobParams)
          .then((result) => {
            res.success(result);
          })
          .catch((error) => {
            res.fail({
              error
            });
          });
      });

      app.use('/api', router);

      // get the intended port number, use port 3000 if not provided
      const port = argv.port || process.env.PORT || 3002;

      // finally, start the express server
      return app.listen(port, (err) => {
        if (err) {
          return logger.error(err.message);
        }

        logger.appStarted(port);

        callback(app);
      });
    };

    expressApp(() => {});
  });
});
