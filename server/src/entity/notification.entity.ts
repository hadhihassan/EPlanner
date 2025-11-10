export interface Notification {
  id?: string;
  userId: string;
  eventId?: string;
  type?: string;
  content: string;
  read?: boolean;
  createdAt?: Date;
}
