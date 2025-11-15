import { Queue } from 'bullmq';
import { connection } from './worker.js'

const remindersQueue = new Queue('reminders', { connection });
const dailyDigestQueue = new Queue('dailyDigest', { connection });

export default {
  add: (queueName: string, jobName: string, payload: any = {}, opts: any = {}) => {
    if (queueName === 'reminders') return remindersQueue.add(jobName, payload, opts);
    if (queueName === 'dailyDigest') return dailyDigestQueue.add(jobName, payload, opts);
    throw new Error(`Unknown queue: ${queueName}`);
  },
  remove: async (jobId: string) => {

    let job = await remindersQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return;
    }

    job = await dailyDigestQueue.getJob(jobId);
    if (job) await job.remove();
  },

  remindersQueue,
  dailyDigestQueue
};
