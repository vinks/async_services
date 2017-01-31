const Queue = require('bull');
const logger = require('./logger');

const receiveAQueue = Queue('Server A');
const receiveBQueue = Queue('Server B');

receiveAQueue.process((job, done) => {
  logger.info(`Received message ${job.data.msg}`);
  done();
});

receiveBQueue.process((job, done) => {
  logger.info(`Received message ${job.data.msg}`);
  done();
});
