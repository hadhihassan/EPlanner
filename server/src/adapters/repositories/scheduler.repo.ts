import QueueAdapter from '../../frameworks/jobs/queue.js';
import JobMetaModel from '../../frameworks/database/models/jobMeta.model.js';

/**
 * Schedule an event reminder job (one hourse before event start).
 */
export const scheduleEventReminder = async (eventId: string, startAt: Date) => {
  const now = new Date();
  const reminderTime = new Date(startAt.getTime() - 60 * 60 * 1000); //1 one house before

  if (reminderTime <= now) {
    return null;
  }
  const delay = reminderTime.getTime() - now.getTime();

  try {
    // Remove existing job if any
    const existingJob = await JobMetaModel.findOne({ event: eventId, type: 'eventReminder' });
    if (existingJob) {
      await QueueAdapter.remove(existingJob.jobId);
      await JobMetaModel.deleteOne({ _id: existingJob._id });
    }

    // Add job to BullMQ queue
    const job = await QueueAdapter.add('reminders', 'eventReminder', { eventId }, { 
      delay,
      jobId: `eventReminder:${eventId}:${reminderTime.getTime()}`
    });

    await JobMetaModel.create({
      event: eventId,
      queueName: 'reminders',
      jobId: job.id,
      type: 'eventReminder'
    });

    return job.id;
  } catch (error) {
    console.error('Error scheduling event reminder:', error);
    return null;
  }
};

/**
 * Schedule daily digest job (runs every day at 8 AM - PRODUCTION).
 */
export const scheduleDailyDigest = async () => {
  try {
    const existing = await JobMetaModel.findOne({ type: 'dailyDigest' });
    if (existing) {
      return existing.jobId;
    }

    // Schedule recurring job - EVERY DAY AT 8 AM (PRODUCTION)
    const job = await QueueAdapter.add(
      'dailyDigest',
      'dailyDigest',
      {},
      {
        repeat: {
          pattern: '0 8 * * *', // Every day at 8 AM (PRODUCTION)
          tz: 'UTC'
        },
        jobId: 'dailyDigest:recurring'
      }
    );

    await JobMetaModel.create({
      event: null,
      queueName: 'dailyDigest',
      jobId: job.id || 'dailyDigest:recurring',
      type: 'dailyDigest'
    });

    return job.id || 'dailyDigest:recurring';
  } catch (error) {
    console.error('Error scheduling daily digest:', error);
    return null;
  }
};

// scheduler.repo.js

/**
 * Remove all scheduled jobs for an event.
 * @param eventId - The ID of the event.
 */
export const removeAllEventJobs = async (eventId: string) => {
  try {
    // Find all job metadata for this event
    const jobs = await JobMetaModel.find({ event: eventId });
    
    if (jobs.length === 0) {
      console.log(`ℹ️ No scheduled jobs found for event ${eventId}`);
      return;
    }

    // Remove jobs from queues
    const removalPromises = jobs.map(async (job) => {
      try {
        await QueueAdapter.remove(job.jobId);
        console.log(`✅ Removed job ${job.jobId} from queue ${job.queueName}`);
      } catch (error: any) {
        console.warn(`⚠️ Could not remove job ${job.jobId}:`, error?.message);
      }
    });

    await Promise.all(removalPromises);

    // Remove job metadata from database
    await JobMetaModel.deleteMany({ event: eventId });
    
    console.log(`✅ Removed ${jobs.length} scheduled job(s) for event ${eventId}`);
  } catch (error) {
    console.error(`❌ Error removing jobs for event ${eventId}:`, error);
    throw error; // Re-throw to handle in calling function
  }
};