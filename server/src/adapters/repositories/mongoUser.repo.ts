import { UserRepository } from '../../usecase/interfaces/userRepository.js';
import { User } from '../../entity/user.entity.js';
import UserModel from '../../frameworks/database/models/user.model.js';

export class MongoUserRepository implements UserRepository {
  async create(user: Omit<User, 'id'>): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.passwordHash,
      role: user.role
    });
    return new User(doc._id.toString(), doc.name, doc.email, doc.password, doc.role);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).lean();
    if (!doc) return null;
    return new User(doc._id.toString(), doc.name, doc.email, doc.password, doc.role);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;
    return new User(doc._id.toString(), doc.name, doc.email, doc.password, doc.role);
  }
}
