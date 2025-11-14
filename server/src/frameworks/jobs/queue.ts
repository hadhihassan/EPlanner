import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

// Create Redis connection
const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null
});

// Create queues
const remindersQueue = new Queue('reminders', { connection });
const dailyDigestQueue = new Queue('dailyDigest', { connection });

// Helper for adding/removing jobs
export default {
  add: (queueName: string, jobName: string, payload: any = {}, opts: any = {}) => {
    if (queueName === 'reminders') return remindersQueue.add(jobName, payload, opts);
    if (queueName === 'dailyDigest') return dailyDigestQueue.add(jobName, payload, opts);
    throw new Error(`Unknown queue: ${queueName}`);
  },
  remove: async (jobId: string) => {
    // Try to remove from reminders queue
    let job = await remindersQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return;
    }
    // Try to remove from daily digest queue
    job = await dailyDigestQueue.getJob(jobId);
    if (job) await job.remove();
  },
  // Expose queues for worker
  remindersQueue,
  dailyDigestQueue
};
