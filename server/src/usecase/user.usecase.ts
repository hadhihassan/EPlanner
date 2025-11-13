import { MongoUserRepository } from '../adapters/repositories/mongoUser.repo.js';
import { User } from '../entity/user.entity.js';

export class UserUseCase {
  constructor(private readonly userRepo: MongoUserRepository) {}

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.userRepo.findByIds(ids);
  }
}
