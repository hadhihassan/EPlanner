import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let connection;

if (env.REDIS_URL) {
  connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
  });
  console.log("🔗 Connected to Render Redis via REDIS_URL");
} else {
  connection = new Redis({
    host: env.REDIS_HOST || "127.0.0.1",
    port: Number(env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
  });
  console.log(`🔗 Connected to Local Redis at ${env.REDIS_HOST}:${env.REDIS_PORT}`);
}

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
