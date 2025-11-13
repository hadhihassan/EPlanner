export interface IUserSummary {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface IMessage {
  id?: string;
  eventId: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: IUserSummary;
}
