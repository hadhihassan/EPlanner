import NotificationModel from '../../frameworks/database/models/notification.model.js';
import { sendEmail } from './mailer.service.js';
import { getIO } from '../../frameworks/sockets/index.js';
import UserModel from '../../frameworks/database/models/user.model.js';
import EventModel from '../../frameworks/database/models/event.model.js';

/**
 * Create notification in database and emit via socket
 */
export async function createAndEmitNotification(
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

/**
 * Send email and create notification for a user
 */
export async function sendNotificationWithEmail(
  userId: string,
  type: string,
  title: string,
  content: string,
  emailSubject: string,
  emailContent: string,
  eventId?: string,
  metadata?: any
) {
  try {
    // Get user email
    const user = await UserModel.findById(userId).lean();
    if (!user || !user.email) {
      console.log(`User ${userId} not found or has no email`);
      return;
    }
    console.log('last =>', arguments)
    // Send email
    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: content,
      html: emailContent
    });

    // Create in-app notification
    await createAndEmitNotification(userId, type, title, content, eventId, metadata);
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
}

/**
 * Notify users about a new event
 */
export async function notifyEventCreated(eventId: string, organizerId: string) {
  try {
    const event = await EventModel.findById(eventId)
      .populate('organizer participants', 'email name _id')
      .lean();

    if (!event) return;

    const organizer = event.organizer as any;
    const participants = (event.participants || []) as any[];
    const eventStartTime = new Date(event.startAt).toLocaleString();

    // Notify organizer
    if (organizer && organizer.email) {
      const emailSubject = `Event Created: ${event.title}`;
      const emailContent = `
        <h2>Event Created Successfully</h2>
        <p>You have created a new event: "<strong>${event.title}</strong>"</p>
        <p><strong>Start Time:</strong> ${eventStartTime}</p>
        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
        ${event.description ? `<p>${event.description}</p>` : ''}
        ${participants.length > 0 ? `<p><strong>Participants:</strong> ${participants.length}</p>` : ''}
      `;

      await sendNotificationWithEmail(
        organizer._id.toString(),
        'event_created',
        `Event Created: ${event.title}`,
        `You have created a new event "${event.title}" starting at ${eventStartTime}`,
        emailSubject,
        emailContent,
        eventId,
        { eventTitle: event.title, startAt: event.startAt }
      );
    }

    // Notify existing participants if any
    if (participants.length > 0) {
      const emailSubject = `New Event: ${event.title}`;
      
      await Promise.all(
        participants.map(async (participant: any) => {
          if (!participant || !participant.email) return;

          const emailContent = `
            <h2>New Event Invitation</h2>
            <p>You have been added to a new event: "<strong>${event.title}</strong>"</p>
            <p><strong>Organizer:</strong> ${organizer.name}</p>
            <p><strong>Start Time:</strong> ${eventStartTime}</p>
            ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
            ${event.description ? `<p>${event.description}</p>` : ''}
          `;

          await sendNotificationWithEmail(
            participant._id.toString(),
            'event_created',
            `New Event: ${event.title}`,
            `You have been invited to event "${event.title}" starting at ${eventStartTime}`,
            emailSubject,
            emailContent,
            eventId,
            { eventTitle: event.title, startAt: event.startAt, organizerName: organizer.name }
          );
        })
      );
    }

    console.log(`✅ Notified ${1 + participants.length} users about event creation: ${eventId}`);
  } catch (error) {
    console.error('Error notifying event creation:', error);
  }
}

/**
 * Notify users about event update
 */
export async function notifyEventUpdated(eventId: string, updatedFields: string[]) {
  try {
    const event = await EventModel.findById(eventId)
      .populate('organizer participants', 'email name _id')
      .lean();

    if (!event) return;

    const organizer = event.organizer as any;
    const participants = (event.participants || []) as any[];
    const eventStartTime = new Date(event.startAt).toLocaleString();
    
    // Get all users to notify (organizer + participants)
    const allUsers = [...participants, organizer].filter(Boolean);
    const uniqueUsers = Array.from(
      new Map(allUsers.map((u: any) => [u._id.toString(), u])).values()
    );

    const emailSubject = `Event Updated: ${event.title}`;
    const fieldsDescription = updatedFields.join(', ');
    
    await Promise.all(
      uniqueUsers.map(async (user: any) => {
        if (!user || !user.email) return;

        const emailContent = `
          <h2>Event Updated</h2>
          <p>The event "<strong>${event.title}</strong>" has been updated.</p>
          <p><strong>Updated Fields:</strong> ${fieldsDescription}</p>
          <p><strong>Start Time:</strong> ${eventStartTime}</p>
          ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
          ${event.description ? `<p>${event.description}</p>` : ''}
        `;

        await sendNotificationWithEmail(
          user._id.toString(),
          'event_updated',
          `Event Updated: ${event.title}`,
          `The event "${event.title}" has been updated. Updated fields: ${fieldsDescription}`,
          emailSubject,
          emailContent,
          eventId,
          { eventTitle: event.title, updatedFields, startAt: event.startAt }
        );
      })
    );

    console.log(`✅ Notified ${uniqueUsers.length} users about event update: ${eventId}`);
  } catch (error) {
    console.error('Error notifying event update:', error);
  }
}

/**
 * Notify new participants about being added to an event
 */
export async function notifyParticipantsAdded(eventId: string, newParticipantIds: string[]) {
  try {
    console.log('nofificaion server reachdd')
    const event = await EventModel.findById(eventId)
      .populate('organizer participants', 'email name _id')
      .lean();
    console.log("event details => ", event?.organizer, event?.participants)
    if (!event) return;

    const organizer = event.organizer as any;
    const eventStartTime = new Date(event.startAt).toLocaleString();

    // Get new participants
    const newParticipants = await UserModel.find({
      _id: { $in: newParticipantIds }
    }).lean();
    console.log('new participants', newParticipantIds)
    const emailSubject = `You've been added to: ${event.title}`;

    await Promise.all(
      newParticipants.map(async (participant: any) => {
        if (!participant || !participant.email) return;

        const emailContent = `
          <h2>Event Invitation</h2>
          <p>You have been added to the event: "<strong>${event.title}</strong>"</p>
          <p><strong>Organizer:</strong> ${organizer.name}</p>
          <p><strong>Start Time:</strong> ${eventStartTime}</p>
          ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
          ${event.description ? `<p>${event.description}</p>` : ''}
          <p>We look forward to seeing you there!</p>
        `;
        console.log("sending");
        
        await sendNotificationWithEmail(
          participant._id.toString(),
          'user_added',
          `Invitation to Event: ${event.title}`,
          `You have been invited to event "${event.title}" by ${organizer.name}. Starts at ${eventStartTime}`,
          emailSubject,
          emailContent,
          eventId,
          { eventTitle: event.title, startAt: event.startAt, organizerName: organizer.name }
        );
        console.log("sended");
      })
    );

    // Also notify organizer about new participants
    if (organizer && organizer.email) {
      const participantNames = newParticipants.map((p: any) => p.name).join(', ');
      const emailContent = `
        <h2>Participants Added</h2>
        <p>You have added ${newParticipants.length} new participant(s) to the event: "<strong>${event.title}</strong>"</p>
        <p><strong>New Participants:</strong> ${participantNames}</p>
        <p><strong>Start Time:</strong> ${eventStartTime}</p>
      `;

      await sendNotificationWithEmail(
        organizer._id.toString(),
        'user_added',
        `Participants Added to: ${event.title}`,
        `You have added ${newParticipants.length} participant(s) to event "${event.title}"`,
        `Participants Added: ${event.title}`,
        emailContent,
        eventId,
        { eventTitle: event.title, participantCount: newParticipants.length }
      );
    }

    console.log(`✅ Notified ${newParticipants.length} new participants about event: ${eventId}`);
  } catch (error) {
    console.error('Error notifying participants added:', error);
  }
}

