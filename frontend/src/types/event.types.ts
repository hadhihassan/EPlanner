import type { User } from "./auth.types"

export interface IAttachment {
    url: string
    filename: string
    provider: string
}

export interface IEvent {
    id:string
    title: string
    description: string
    category: string
    startAt: Date
    endAt: Date
    organizer: string | User
    participants: Array<string | User>
    location: string
    attachments: IAttachment[]
    status: string
    jobId: string
}
