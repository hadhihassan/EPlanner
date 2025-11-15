import type { User } from "./auth.types"

export interface IAttachment {
  url: string
  filename: string
  provider: string
}

export interface IEvent {
  id?: string
  _id?: string
  title: string
  description: string
  category: string
  startAt: Date | string
  endAt: Date | string
  organizer: string | User
  participants: string[] | User[]
  location: string
  attachments: IAttachment[]
  status: string
  jobId?: string | null
}

export interface EventState {
  events: Event[];
  selectedEvent?: Event | null;
  loading: boolean;
  error?: string | null;
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}

export interface EventFormDataShape {
  title: string;
  description: string;
  category: string;
  startAt: string;
  endAt: string;
  location: string;
}