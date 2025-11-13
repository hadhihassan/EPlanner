import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import EventModel from '../database/models/event.model.js';
import NotificationModel from '../database/models/notification.model.js';
import { sendEmail } from '../../adapters/services/mailer.service.js';
import { getIO } from '../sockets/index.js';
import mongoose from 'mongoose';

// Redis connection for the worker
const connection = new Redis({ 
  host: env.REDIS_HOST, 
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null
});

// Connect to MongoDB
mongoose.connect(env.MONGO_URI).then(() => {
  console.log('✅ Worker connected to MongoDB');
}).catch(err => {
  console.error('❌ Worker MongoDB connection error:', err);
  process.exit(1);
});

/**
 * Create notification in database and emit via socket
 */
async function createAndEmitNotification(
  userId: string,
  type: string,
  title: string,
  content: string,
  eventId?: string,
  metadata?: any
) {
  try {
    // Create notification in database
    const notification = await NotificationModel.create({
      userId,
      eventId,
      type,
      title,
      content,
      metadata
    });

    // Emit notification via socket if user is online
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification', {
        id: notification._id.toString(),
        userId,
        eventId: eventId || undefined,
        type,
        title,
        content,
        read: false,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Worker for event reminders
const remindersWorker = new Worker(
  'reminders',
  async (job) => {
    if (job.name === 'eventReminder') {
      const { eventId } = job.data;
      
      const event = await EventModel.findById(eventId)
        .populate('participants organizer', 'email name _id')
        .lean();

      if (!event) {
        console.log(`⚠️ Event ${eventId} not found, skipping reminder`);
        return;
      }

      const participants = event.participants || [];
      const organizer = event.organizer;
      const allUsers = [...participants, organizer].filter(Boolean);

      // Remove duplicates
      const uniqueUsers = Array.from(
        new Map(allUsers.map((u: any) => [u._id.toString(), u])).values()
      );

      const eventStartTime = new Date(event.startAt).toLocaleString();
      const subject = `Reminder: ${event.title} starts in 1 hour`;
      const emailContent = `
        <h2>Event Reminder</h2>
        <p>Your event "<strong>${event.title}</strong>" starts at ${eventStartTime}</p>
        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
        ${event.description ? `<p>${event.description}</p>` : ''}
      `;
      const textContent = `Your event "${event.title}" starts at ${eventStartTime}${event.location ? ` at ${event.location}` : ''}`;

      // Send emails and create notifications
      await Promise.all(
        uniqueUsers.map(async (user: any) => {
          if (!user || !user.email) return;

          try {
            // Send email
            await sendEmail({
              to: user.email,
              subject,
              text: textContent,
              html: emailContent
            });

            // Create in-app notification
            await createAndEmitNotification(
              user._id.toString(),
              'event_reminder',
              `Event Reminder: ${event.title}`,
              `Your event "${event.title}" starts at ${eventStartTime}`,
              eventId,
              { eventTitle: event.title, startAt: event.startAt }
            );
          } catch (error) {
            console.error(`Error sending reminder to ${user.email}:`, error);
          }
        })
      );

      console.log(`📧 Reminder sent for event ${eventId} to ${uniqueUsers.length} users`);
    }
  },
  { connection }
);

// Worker for daily digest
const dailyDigestWorker = new Worker(
  'dailyDigest',
  async (job) => {
    if (job.name === 'dailyDigest') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find all events happening tomorrow
      const events = await EventModel.find({
        startAt: {
          $gte: today,
          $lt: tomorrow
        }
      })
        .populate('participants organizer', 'email name _id')
        .lean();

      console.log(`📅 Found ${events.length} events for daily digest`);

      // Group events by user
      const userEventsMap = new Map<string, any[]>();

      events.forEach((event: any) => {
        const participants = event.participants || [];
        const organizer = event.organizer;
        const allUsers = [...participants, organizer].filter(Boolean);

        allUsers.forEach((user: any) => {
          if (!user || !user._id) return;
          const userId = user._id.toString();
          if (!userEventsMap.has(userId)) {
            userEventsMap.set(userId, []);
          }
          userEventsMap.get(userId)!.push({
            event,
            userEmail: user.email,
            userName: user.name
          });
        });
      });

      // Send digest to each user
      await Promise.all(
        Array.from(userEventsMap.entries()).map(async ([userId, userEvents]) => {
          if (userEvents.length === 0) return;

          const { userEmail, userName } = userEvents[0];
          if (!userEmail) return;

          // Remove duplicates
          const uniqueEvents = Array.from(
            new Map(userEvents.map((ue: any) => [ue.event._id.toString(), ue.event])).values()
          );

          const eventList = uniqueEvents
            .map((event: any) => {
              const time = new Date(event.startAt).toLocaleString();
              return `<li><strong>${event.title}</strong> - ${time}${event.location ? ` at ${event.location}` : ''}</li>`;
            })
            .join('');

          const subject = `Daily Digest: ${uniqueEvents.length} event(s) tomorrow`;
          const emailContent = `
            <h2>Daily Event Digest</h2>
            <p>Hi ${userName},</p>
            <p>You have <strong>${uniqueEvents.length}</strong> event(s) scheduled for tomorrow:</p>
            <ul>${eventList}</ul>
          `;
          const textContent = `Hi ${userName},\n\nYou have ${uniqueEvents.length} event(s) scheduled for tomorrow:\n${uniqueEvents.map((e: any) => `- ${e.title} at ${new Date(e.startAt).toLocaleString()}`).join('\n')}`;

          try {
            // Send email
            await sendEmail({
              to: userEmail,
              subject,
              text: textContent,
              html: emailContent
            });

            // Create in-app notification
            await createAndEmitNotification(
              userId,
              'daily_digest',
              `Daily Digest: ${uniqueEvents.length} event(s) tomorrow`,
              `You have ${uniqueEvents.length} event(s) scheduled for tomorrow`,
              undefined,
              { eventCount: uniqueEvents.length, events: uniqueEvents.map((e: any) => e._id.toString()) }
            );
          } catch (error) {
            console.error(`Error sending digest to ${userEmail}:`, error);
          }
        })
      );

      console.log(`📧 Daily digest sent to ${userEventsMap.size} users`);
    }
  },
  { connection }
);

// Event logs
remindersWorker.on('completed', (job) => {
  console.log(`✅ Reminder job completed: ${job.id}`);
});

remindersWorker.on('failed', (job, err) => {
  console.error(`❌ Reminder job failed: ${job?.id}`, err);
});

dailyDigestWorker.on('completed', (job) => {
  console.log(`✅ Daily digest job completed: ${job.id}`);
});

dailyDigestWorker.on('failed', (job, err) => {
  console.error(`❌ Daily digest job failed: ${job?.id}`, err);
});

console.log('🚀 Workers started: reminders, dailyDigest');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down workers...');
  await remindersWorker.close();
  await dailyDigestWorker.close();
  await connection.quit();
  await mongoose.connection.close();
  process.exit(0);
});
