import api from './axios';

export interface Notification {
  id: string;
  userId: string;
  eventId?: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
}

export const notificationApi = {
  list: (filters?: { read?: boolean; page?: number; limit?: number }) => {
    return api.get<NotificationListResponse>('/notification', { params: filters });
  },

  getUnreadCount: () => {
    return api.get<{ count: number }>('/notification/unread-count');
  },

  markAsRead: (id: string) => {
    return api.patch<Notification>(`/notification/${id}/read`);
  },

  markAllAsRead: () => {
    return api.patch<{ count: number }>('/notification/read-all');
  },

  delete: (id: string) => {
    return api.delete(`/notification/${id}`);
  },
};

