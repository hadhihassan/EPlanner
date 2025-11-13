import { MongoMessageRepository } from '../adapters/repositories/mongoMessage.repository.js';
import { Message } from '../entity/message.entity.js';

export class MessageUseCase {
  constructor(private messageRepo: MongoMessageRepository) {}

  async getEventMessages(eventId: string): Promise<Message[]> {
    return this.messageRepo.listByEvent(eventId);
  }

  async sendMessage(msg: Message): Promise<Message> {
    return this.messageRepo.create(msg);
  }
}
