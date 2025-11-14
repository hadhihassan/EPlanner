import EventModel from '../../frameworks/database/models/event.model.js';
import { Event } from '../../entity/event.entity.js';

export class MongoEventRepository {
  async create(event: Partial<Event>): Promise<Event> {
    const doc = await EventModel.create(event);
    return this.map(doc);
  }

  async findById(id: string): Promise<Event | null> {
    const doc = await EventModel.findById(id).lean();
    return doc ? this.map(doc) : null;
  }

  async updateJobId(id: string, jobId: string | null): Promise<void> {
    await EventModel.findByIdAndUpdate(id, { jobId });
  }

  async update(id: string, payload: Partial<Event>): Promise<Event> {
    const doc = await EventModel.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!doc) throw Object.assign(new Error('Event not found'), { status: 404 });
    return this.map(doc);
  }

  async delete(id: string): Promise<void> {
    await EventModel.findByIdAndDelete(id);
  }

  async addUsers(id: string, participants: string[]): Promise<void> {
    await EventModel.findByIdAndUpdate(
      id,
      { $addToSet: { participants: { $each: participants } } },
    );
  }

  async list(user: any, filters: { q?: string; status?: string; page?: number; limit?: number }): Promise<{ events: Event[], total: number, page: number, totalPages: number }> {
    const { q, status, page = 1, limit = 10 } = filters;
    const filter: any = {};

    if (user.role !== 'admin') {
      filter.$or = [
        { organizer: user.id },
        { participants: user.id },
      ];
    }

    if (status?.trim()) {
      filter.status = status;
    }

    if (q?.trim()) {
      filter.$text = { $search: q };
    }

    const skip = (page - 1) * limit;

    const total = await EventModel.countDocuments(filter);

    const docs = await EventModel.find(filter)
      .sort({
        ...(q?.trim() ? { score: { $meta: "textScore" } } : {}),
        startAt: 1
      })
      .skip(skip)
      .limit(limit)
      .populate('organizer participants', 'name email role')
      .lean();
    const totalPages = Math.ceil(total / limit);

    return {
      events: docs.map(this.map),
      total,
      page,
      totalPages
    };
  }

  private map(doc: any): Event {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      category: doc.category,
      startAt: doc.startAt,
      endAt: doc.endAt,
      organizer: doc.organizer?._id?.toString() || doc.organizer,
      participants: (doc.participants || []).map((p: any) => p?._id?.toString?.() || p),
      location: doc.location,
      attachments: doc.attachments || [],
      status: doc.status,
      jobId: doc.jobId
    };
  }
}
