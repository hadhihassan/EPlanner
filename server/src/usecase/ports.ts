import { User } from '../entity/user.entity.js';
import { Event } from '../entity/event.entity.js';

export interface UserRepository {
  create(user: Omit<User, 'id'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
};

export interface EventRepository {
  create(event: Partial<Event>): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  update(id: string, payload: Partial<Event>): Promise<Event>;
  delete(id: string): Promise<void>;
  list(opts: { q?: string; page?: number; limit?: number; status?: string }): Promise<Event[]>;
}
