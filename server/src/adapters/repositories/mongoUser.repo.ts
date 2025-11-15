import { UserRepository } from '../../usecase/interfaces/userRepository.js';
import { User } from '../../entity/user.entity.js';
import UserModel from '../../frameworks/database/models/user.model.js';

export class MongoUserRepository implements UserRepository {
  async create(user: Omit<User, 'id'>): Promise<User> {
    console.log('Creating user:', user);

    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role || 'participant',
    });

    return new User(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.role,
      doc.password
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).lean();
    if (!doc) return null;

    return new User(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.role,
      doc.password
    );
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;

    return new User(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.role,
      doc.password
    );
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const docs = await UserModel.find({ _id: { $in: ids } })
      .select('-password')
      .lean();

    return docs.map((doc) => this.map(doc));
  }

  private map(doc: any): User {
    return new User(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.role || 'participant'
    );
  }
}
