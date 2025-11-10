export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Attachment {
  url: string;
  filename?: string;
  provider?: string;
}

export interface Event {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  startAt: Date;
  endAt?: Date;
  organizer: string; // user id
  participants?: string[];
  location?: string;
  attachments?: Attachment[];
  status?: EventStatus;
  jobId?: string | null;
}
