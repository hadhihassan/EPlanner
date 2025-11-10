import { User } from '../../entity/user.entity.js';

export interface UserRepository {
  create(user: Omit<User, 'id'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
