import NotificationModel from '../../frameworks/database/models/notification.model.js';
import { Notification } from '../../entity/notification.entity.js';

export class MongoNotificationRepository {
  async create(notification: Partial<Notification>): Promise<Notification> {
    const doc = await NotificationModel.create(notification);
    return this.map(doc);
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findById(id).lean();
    return doc ? this.map(doc) : null;
  }

  async findByUserId(
    userId: string, 
    filters: { read?: boolean; limit?: number; page?: number }
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { read, limit = 50, page = 1 } = filters;
    const filter: any = { userId };
    
    if (read !== undefined) filter.read = read;

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('eventId', 'title startAt')
        .lean(),
      NotificationModel.countDocuments(filter)
    ]);

    return {
      notifications: docs.map(this.map),
      total
    };
  }

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    ).lean();
    return doc ? this.map(doc) : null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany(
      { userId, read: false },
      { read: true }
    );
    return result.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, read: false });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await NotificationModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  private map(doc: any): Notification {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      eventId: doc.eventId?.toString(),
      type: doc.type,
      title: doc.title,
      content: doc.content,
      read: doc.read,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}

