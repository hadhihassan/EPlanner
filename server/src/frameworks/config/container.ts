import { MongoUserRepository } from '../../adapters/repositories/mongoUser.repo.js';
import { JwtTokenService } from '../../adapters/services/jwtToken.service.js';
import { BcryptHashService } from '../../adapters/services/bcryptHash.service.js';
import { AuthUseCase } from '../../usecase/authUsecase.js';
import { AuthController } from '../../adapters/controllers/auth.controller.js';

class Container {
  private services: Record<string, any> = {};

  constructor() {
    // Instantiate dependencies
    const userRepo = new MongoUserRepository();
    const tokenService = new JwtTokenService();
    const hashService = new BcryptHashService();

    // UseCase
    const authUseCase = new AuthUseCase(userRepo, tokenService, hashService);

    // Controller
    const authController = new AuthController(authUseCase);

    // Register
    this.services = {
      userRepo,
      tokenService,
      hashService,
      authUseCase,
      authController
    };
  }

  resolve<T>(key: string): T {
    return this.services[key];
  }
}

export const container = new Container();
