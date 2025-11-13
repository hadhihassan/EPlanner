import { UserRepository } from './interfaces/userRepository.js';
import { TokenService } from './interfaces/tokenService.js';
import { HashService } from './interfaces/hashService.js';
import { Role, User } from '../entity/user.entity.js';

export class AuthUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly hashService: HashService
  ) { }

  async register(data: { name: string; email: string; password: string; role?: Role }) {
    const hashed = await this.hashService.hash(data.password);

    const newUser = new User(
      null,
      data.name,
      data.email,
      data.role || 'participant',
      hashed
    );
    const user = await this.userRepo.create(newUser);

    const tokens = this.tokenService.generatePair({
      id: user.id,
      role: user.role
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const valid = await this.hashService.compare(password, user?.password || '');

    if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const token = this.tokenService.generatePair({ id: user.id, role: user.role });
    return { user, ...token };
  }

  async me(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

    return user;
  };

  async refresh(oldRefreshToken: string) {
    const decoded = this.tokenService.verifyRefresh(oldRefreshToken);
    const tokens = this.tokenService.generatePair({ id: (decoded as any).id, role: (decoded as any).role });
    return tokens;
  }
}
