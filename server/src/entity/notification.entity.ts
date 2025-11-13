export type NotificationType = 
  | 'event_reminder' 
  | 'event_created' 
  | 'event_updated' 
  | 'event_deleted' 
  | 'daily_digest' 
  | 'user_added';

export interface Notification {
  id?: string;
  userId: string;
  eventId?: string;
  type: NotificationType;
  title: string;
  content: string;
  read?: boolean;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
