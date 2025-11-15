import MessageModel from '../../frameworks/database/models/message.model.js';
import { Message } from '../../entity/message.entity.js';

export class MongoMessageRepository {
  async create(msg: Message): Promise<Message> {
    let newMessage = await MessageModel.create(msg);
    let doc = await this.findById(newMessage?._id?.toString());

    return this.map(doc);
  }

  async findById(_id: string): Promise<Message> {
    const doc = await MessageModel.findById(_id)
      .populate('userId', '_id name email avatar role')
      .lean();

    return this.map(doc);
  }

  async listByEvent(eventId: string, limit = 50): Promise<Message[]> {
    const docs = await MessageModel.find({ eventId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('userId', 'name email avatar')
      .lean();

    return docs.map(this.map);
  }

  private map(doc: any): Message {
    return {
      id: doc?.id?.toString() || doc._id.toString(),
      eventId: doc.eventId.toString(),
      userId: doc.userId?._id?.toString() || doc.userId,
      text: doc.text,
      createdAt: doc.createdAt,
      user: {
        id: doc.user?.id?.toString() || doc.userId?._id?.toString(),
        name: doc.user?.name || doc.userId?.name,
        email: doc.user?.email || doc.userId?.email,
      },
    };
  }
}
