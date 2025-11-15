import { MongoEventRepository } from '../adapters/repositories/mongoEvent.repo.js';
import { Event } from '../entity/event.entity.js';
import { removeAllEventJobs, scheduleEventReminder } from '../adapters/repositories/scheduler.repo.js';
import UserModel from '../frameworks/database/models/user.model.js';
import { notifyEventCreated, notifyEventUpdated, notifyParticipantsAdded } from '../adapters/services/notification.service.js';

export class EventUseCase {
  constructor(private readonly eventRepo: MongoEventRepository) { }

  async create(payload: Partial<Event>, user: any) {
    payload.organizer = user.id;
    let event = await this.eventRepo.create(payload);

    if (event.startAt && new Date(event.startAt) > new Date()) {
      const jobId = await scheduleEventReminder(event.id!, new Date(event.startAt));
      if (jobId) {
        event = await this.eventRepo.update(event.id!, { jobId });
      }
    }
    notifyEventCreated(event.id!, user.id).catch(error => {
      console.error('Failed to send creation notifications:', error);
    });
    return event;
  }

  async list(user: any, filters: any) {
    return this.eventRepo.list(user, filters);
  }

  async getById(id: string, user: any) {
    const event = await this.eventRepo.findById(id);
    if (!event) throw Object.assign(new Error('Event not found'), { status: 404 });

    return event
  }

  async update(id: string, payload: Partial<Event> & {
    newAttachments?: any[];
    removedPublicIds?: string[];
  }, user: any) {
    const existing = await this.eventRepo.findById(id);
    if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });

    if (existing.organizer.toString() !== user.id)
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    let updatedAttachments = [...(existing.attachments || [])];

    if (payload.removedPublicIds && payload.removedPublicIds.length > 0) {
      updatedAttachments = updatedAttachments.filter(
        att => !payload.removedPublicIds!.includes(att?.public_id)
      );
    }

    if (payload.newAttachments && payload.newAttachments.length > 0) {
      updatedAttachments.push(...payload.newAttachments);
    }

    const updatePayload = {
      ...payload,
      attachments: updatedAttachments
    };

    const updatedFields: string[] = [];
    if (payload.title !== undefined && payload.title !== existing.title) updatedFields.push('title');
    if (payload.description !== undefined && payload.description !== existing.description) updatedFields.push('description');
    if (payload.location !== undefined && payload.location !== existing.location) updatedFields.push('location');

    if (payload.startAt !== undefined) {
      const newStartAt = new Date(payload.startAt).getTime();
      const oldStartAt = new Date(existing.startAt).getTime();

      if (newStartAt !== oldStartAt) {
        await removeAllEventJobs(id);

        if (new Date(payload.startAt) > new Date()) {
          const jobId = await scheduleEventReminder(id, new Date(payload.startAt));
          if (jobId) {
            payload.jobId = jobId;
          }
        } else {
          payload.jobId = null;
        }
      }
    }

    if (payload.endAt !== undefined) {
      const newEndAt = payload.endAt ? new Date(payload.endAt).getTime() : null;
      const oldEndAt = existing.endAt ? new Date(existing.endAt).getTime() : null;
      if (newEndAt !== oldEndAt) updatedFields.push('end time');
    }

    if (payload.category !== undefined && payload.category !== existing.category) updatedFields.push('category');

    const updatedEvent = await this.eventRepo.update(id, updatePayload);

    if (updatedFields.length > 0) {
      notifyEventUpdated(id, updatedFields);
    }

    return updatedEvent;
  }

  async remove(id: string, user: any) {
    const existing = await this.eventRepo.findById(id);
    if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });

    if (existing.organizer !== user.id)
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    await removeAllEventJobs(id);

    await this.eventRepo.delete(id);
    return true;
  }

  async addUsers(id: string, user: any, participants: string[]) {
    const existing = await this.eventRepo.findById(id);
    if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });

    if (existing.organizer !== user.id)
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    const existingParticipants = existing.participants || [];
    const newParticipants = participants.filter(
      pid => !existingParticipants.includes(pid)
    );

    if (newParticipants.length === 0) {
      return true;
    }

    await this.eventRepo.addUsers(id, newParticipants);

    notifyParticipantsAdded(id, newParticipants).catch(error => {
      console.error('Failed to send participant notifications:', error);
    });

    return true;
  }

  async listEligibleUsers(eventId: string, currentUserId: string) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { status: 404 });

    const participants = event.participants || [];
    const excludedIds = [currentUserId, ...participants];
    const users = await UserModel.find({
      _id: { $nin: excludedIds },
      $and: [
        { name: { $exists: true } },
        { email: { $exists: true } }
      ]
    })
      .select('_id name email role')
      .lean();

    return users;
  }
}
