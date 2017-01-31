const axios = require('axios');
const morgan = require('morgan');
const express = require('express');
const minimist = require('minimist');
const jsendie = require('jsendie');
const async = require('async');
const timeout = require('async-timeout');

const config = require('./config');
const logger = require('./logger');

const argv = minimist(process.argv.slice(2));

const aServiceInstance = axios.create({
  baseURL: config.aServiceBaseUrl,
  timeout: 8000,
  headers: { Accept: 'application/json' },
});

const bServiceInstance = axios.create({
  baseURL: config.bServiceBaseUrl,
  timeout: 8000,
  headers: { Accept: 'application/json' },
});


const firstRequest = ({ x, y }) => timeout((callback) => {
  aServiceInstance.get(`run/${x}/${y}`)
    .then((response) => {
      if (response.data && response.data.status === 'success') {
        return callback(null, response.data.data);
      }

      return callback(null);
    })
    .catch((error) => {
      return callback(null);
    });
}, config.firstRequestTimeout, 'FALLBACK RESP IN CASE OF TIMEOUT');

const secondRequest = ({ x, y }) => timeout((callback) => {
  bServiceInstance.get(`run/${x}/${y}`)
    .then((response) => {
      if (response.data && response.data.status === 'success') {
        return callback(null, response.data.data);
      }

      return callback(null);
    })
    .catch((error) => {
      return callback(null);
    });
}, config.secondRequestTimeout, 'FALLBACK RESP IN CASE OF TIMEOUT');

// Initialize express server
const expressApp = (callback) => {
  const app = express();
  app.use(morgan('dev'));
  app.use(jsendie());

  app.get('/view/:x/:y', (req, res) => {
    const queryParams = {
      x: req.params.x,
      y: req.params.y
    };

    async.parallel([
      firstRequest(queryParams),
      secondRequest(queryParams)
    ], (error, results) => {
      const resultsArr = results.map(r => ({
        result: r.result
      }));

      res.success({ results: resultsArr });
    });
  });

  // get the intended port number, use port 3000 if not provided
  const port = argv.port || process.env.PORT || 3000;

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
