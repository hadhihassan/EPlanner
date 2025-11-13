import { MongoEventRepository } from '../adapters/repositories/mongoEvent.repo.js';
import { Event } from '../entity/event.entity.js';
import { scheduleEventReminder, removeAllEventJobs } from '../adapters/repositories/scheduler.repo.js';
import UserModel from '../frameworks/database/models/user.model.js';
import JobMetaModel from '../frameworks/database/models/jobMeta.model.js';

export class EventUseCase {
  constructor(private readonly eventRepo: MongoEventRepository) { }

  async create(payload: Partial<Event>, user: any) {
    payload.organizer = user.id;
    const event = await this.eventRepo.create(payload);

    // Schedule reminder if event has a future start time
    if (event.startAt && new Date(event.startAt) > new Date()) {
      const jobId = await scheduleEventReminder(event.id!, new Date(event.startAt));
      
      // Save jobId to event
      if (jobId) {
        await this.eventRepo.update(event.id!, { jobId });
      }
    }
    
    return event;
  }

  async list(user: any, filters: any) {
    return this.eventRepo.list(user, filters);
  }

  async getById(id: string, user: any) {
    const event = await this.eventRepo.findById(id);
    if (!event) throw Object.assign(new Error('Event not found'), { status: 404 });

    // RBAC visibility
    return event
    // if (user.role === 'admin') return event;
    // if (user.role === 'organizer' && event.organizer === user.id) return event;
    // if (user.role === 'participant' && event.participants.includes(user.id)) return event;

    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  async update(id: string, payload: Partial<Event>, user: any) {
    const existing = await this.eventRepo.findById(id);
    if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });

    // Allow only admin or owner
    if (user.role !== 'admin' && existing.organizer !== user.id)
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    // If startAt is being updated, reschedule reminder
    if (payload.startAt && payload.startAt !== existing.startAt) {
      // Remove old jobs
      await removeAllEventJobs(id);
      
      // Schedule new reminder if startAt is in the future
      if (new Date(payload.startAt) > new Date()) {
        const jobId = await scheduleEventReminder(id, new Date(payload.startAt));
        if (jobId) {
          payload.jobId = jobId;
        }
      } else {
        payload.jobId = null;
      }
    }

    return this.eventRepo.update(id, payload);
  }

  async remove(id: string, user: any) {
    const existing = await this.eventRepo.findById(id);
    if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });

    if (user.role !== 'admin' && existing.organizer !== user.id)
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    // Remove all scheduled jobs
    await removeAllEventJobs(id);
    
    await this.eventRepo.delete(id);
    return true;
  }

  async addUsers(id: string, user: any, participants: string[]) {
    const existing = await this.eventRepo.findById(id);
    if (!existing) throw Object.assign(new Error('Event not found'), { status: 404 });

    if (user.role !== 'admin' && existing.organizer !== user.id)
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    await this.eventRepo.addUsers(id, participants);
    return true;
  }

  async listEligibleUsers(eventId: string, currentUserId: string) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { status: 404 });

    const excludedIds = [currentUserId, ...event.participants];
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
