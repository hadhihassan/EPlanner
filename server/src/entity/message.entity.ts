export interface Message {
  id?: string;
  eventId: string;      
  userId: string;      
  text: string;
  createdAt?: Date;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}
