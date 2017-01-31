const logger = require('../logger');
const config = require('./config');

module.exports = (queue) => {
  queue.process(config.concurrency, (job, done) => {
    done(null, {
      jobId: job.jobId,
      result: Math.random()
    });
  });

  queue.on('active', (job) => {
    // Job started
    logger.info(`Job started with id ${job.jobId}`);
  });
};
