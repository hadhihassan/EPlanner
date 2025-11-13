import QueueAdapter from '../../frameworks/jobs/queue.js';
import JobMetaModel from '../../frameworks/database/models/jobMeta.model.js';

/**
 * Schedule an event reminder job (1 hour before event start).
 * @param eventId - The ID of the event.
 * @param startAt - The event start date/time.
 * @returns The Job ID if scheduled, null otherwise.
 */
export const scheduleEventReminder = async (eventId: string, startAt: Date) => {
  const now = new Date();
  const reminderTime = new Date(startAt.getTime() - 60 * 60 * 1000); // 1 hour before

  // Only schedule if reminder time is in the future
  if (reminderTime <= now) {
    console.log('⏰ Event reminder time has passed, not scheduling');
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

    // Save job metadata for management
    await JobMetaModel.create({
      event: eventId,
      queueName: 'reminders',
      jobId: job.id,
      type: 'eventReminder'
    });

    console.log(`✅ Scheduled reminder for event ${eventId} at ${reminderTime.toISOString()}`);
    return job.id;
  } catch (error) {
    console.error('Error scheduling event reminder:', error);
    return null;
  }
};

/**
 * Remove a scheduled job (if event is deleted or rescheduled).
 * @param jobId - Job ID returned from BullMQ.
 */
export const removeScheduledJob = async (jobId?: string | null) => {
  if (!jobId) return;
  try {
    await QueueAdapter.remove(jobId);
    await JobMetaModel.deleteOne({ jobId });
  } catch (error) {
    console.error('Error removing scheduled job:', error);
  }
};

/**
 * Remove all scheduled jobs for an event.
 * @param eventId - The ID of the event.
 */
export const removeAllEventJobs = async (eventId: string) => {
  try {
    const jobs = await JobMetaModel.find({ event: eventId });
    await Promise.all(jobs.map(job => QueueAdapter.remove(job.jobId)));
    await JobMetaModel.deleteMany({ event: eventId });
    console.log(`✅ Removed ${jobs.length} scheduled job(s) for event ${eventId}`);
  } catch (error) {
    console.error('Error removing event jobs:', error);
  }
};

/**
 * Schedule daily digest job (runs every day at 8 AM).
 * This should be called once at server startup.
 */
export const scheduleDailyDigest = async () => {
  try {
    // Check if daily digest job already exists
    const existing = await JobMetaModel.findOne({ type: 'dailyDigest' });
    if (existing) {
      console.log('📅 Daily digest job already scheduled');
      return existing.jobId;
    }

    // Calculate delay until next 8 AM
    const now = new Date();
    const next8AM = new Date();
    next8AM.setHours(8, 0, 0, 0);
    
    // If it's past 8 AM today, schedule for tomorrow
    if (now >= next8AM) {
      next8AM.setDate(next8AM.getDate() + 1);
    }

    const delay = next8AM.getTime() - now.getTime();

    // Schedule recurring job (using repeat pattern)
    const job = await QueueAdapter.add(
      'dailyDigest',
      'dailyDigest',
      {},
      {
        delay,
        repeat: {
          pattern: '0 8 * * *', // Every day at 8 AM (cron pattern)
          tz: 'UTC'
        },
        jobId: 'dailyDigest:recurring'
      }
    );

    await JobMetaModel.create({
      event: null as any,
      queueName: 'dailyDigest',
      jobId: job.id,
      type: 'dailyDigest'
    });

    console.log(`✅ Scheduled daily digest job, next run at ${next8AM.toISOString()}`);
    return job.id;
  } catch (error) {
    console.error('Error scheduling daily digest:', error);
    return null;
  }
};
