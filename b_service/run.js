const logger = require('../logger');
const config = require('./config');
const Queue = require('bull');

const sendQueue = Queue('Server B');

module.exports = (queue, newJob) =>
  new Promise((resolve, reject) => {
    const jobId = newJob.id;

    queue.getJob(jobId).then((existedJob) => {
      if (existedJob && existedJob.returnvalue) {
        logger.emergency(`Job from cache with id ${existedJob.jobId}`);
        resolve(existedJob.returnvalue);
      } else {
        const completedCallback = (job, result) => {
          if (job.jobId === jobId) {
            logger.success(`Job completed with id ${job.jobId}`);

            sendQueue.add({ msg: 'Hello' });

            queue.removeListener('completed', completedCallback);
            queue.removeListener('failed', failCallback);

            setTimeout(() => {
              job.remove().then(() => {
                logger.warn(`Job with id ${job.jobId} removed`);
              });
            }, config.ttl);

            resolve(result);
          }
        };

        const failCallback = (job, error) => {
          if (job.jobId === jobId) {
            queue.removeListener('completed', completedCallback);
            queue.removeListener('failed', failCallback);
            reject(error);
          }
        };

        // Listners
        queue.on('completed', completedCallback);
        queue.on('failed', failCallback);

        // Add new job
        queue.add(newJob.data, { jobId });
      }
    });
  });
