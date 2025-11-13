import { MongoUserRepository } from '../../adapters/repositories/mongoUser.repo.js';
import { JwtTokenService } from '../../adapters/services/jwtToken.service.js';
import { BcryptHashService } from '../../adapters/services/bcryptHash.service.js';
import { AuthUseCase } from '../../usecase/auth.usecase.js';
import { AuthController } from '../../adapters/controllers/auth.controller.js';
import { MongoEventRepository } from '../../adapters/repositories/mongoEvent.repo.js';
import { EventUseCase } from '../../usecase/event.usecase.js';
import { EventController } from '../../adapters/controllers/events.controller.js';
import { MongoMessageRepository } from '../../adapters/repositories/mongoMessage.repository.js';
import { MessageUseCase } from '../../usecase/message.usecase.js';
import { MessageController } from '../../adapters/controllers/message.controller.js';
import { UserController } from '../../adapters/controllers/user.controller.js';
import { UserUseCase } from '../../usecase/user.usecase.js';

class Container {
  private services: Record<string, any> = {};

  constructor() {
    // Instantiate dependencies
    const tokenService = new JwtTokenService();
    const hashService = new BcryptHashService();

    // Repository
    const userRepo = new MongoUserRepository();
    const eventRepo = new MongoEventRepository();
    const messageRepo = new MongoMessageRepository();

    // UseCase
    const authUseCase = new AuthUseCase(userRepo, tokenService, hashService);
    const eventUseCase = new EventUseCase(eventRepo);
    const messageUseCase = new MessageUseCase(messageRepo);
    const userUseCase = new UserUseCase(userRepo);

    // Controller
    const authController = new AuthController(authUseCase);
    const eventController = new EventController(eventUseCase)
    const messageController = new MessageController(messageUseCase)
    const userController = new UserController(userUseCase)

    // Register
    this.services = {
      userRepo,
      tokenService,
      hashService,
      authUseCase,
      authController,
      eventUseCase,
      eventRepo,
      eventController,
      messageRepo,
      messageUseCase,
      messageController,
      userUseCase,
      userController,
    };
  }

  resolve<T>(key: string): T {
    return this.services[key];
  }
}

export const container = new Container();
