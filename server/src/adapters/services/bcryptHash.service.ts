import bcrypt from 'bcryptjs';
import { HashService } from '../../usecase/interfaces/hashService.js';

export class BcryptHashService implements HashService {
  async hash(raw: string): Promise<string> {
    return bcrypt.hash(raw, 10);
  }
  async compare(raw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(raw, hash);
  }
}
