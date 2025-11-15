import { MongoNotificationRepository } from '../adapters/repositories/mongoNotification.repo.js';

export class NotificationUseCase {
  constructor(private readonly notificationRepo: MongoNotificationRepository) { }

  async list(userId: string, filters: { read?: boolean; page?: number; limit?: number }) {
    return this.notificationRepo.findByUserId(userId, filters);
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepo.getUnreadCount(userId);
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.markAsRead(id, userId);
    if (!notification) {
      throw Object.assign(new Error('Notification not found'), { status: 404 });
    }
    return notification;
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async delete(id: string, userId: string) {
    const deleted = await this.notificationRepo.delete(id, userId);
    if (!deleted) {
      throw Object.assign(new Error('Notification not found'), { status: 404 });
    }
    return true;
  }
}

