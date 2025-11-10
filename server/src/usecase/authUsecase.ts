import { UserRepository } from './interfaces/userRepository.js';
import { TokenService } from './interfaces/tokenService.js';
import { HashService } from './interfaces/hashService.js';
import { User } from '../entity/user.entity.js';

export class AuthUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly hashService: HashService
  ) {}

  async register(name: string, email: string, password: string, role = 'participant') {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw Object.assign(new Error('Email already exists'), { status: 400 });

    const hash = await this.hashService.hash(password);
    const created = await this.userRepo.create(
      new User(null, name, email, hash, role as any)
    );
    const token = this.tokenService.sign({ id: created.id, role: created.role });
    return { user: created, token };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const valid = await this.hashService.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const token = this.tokenService.sign({ id: user.id, role: user.role });
    return { user, token };
  }

  async me(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    
    return user;
  }
}
