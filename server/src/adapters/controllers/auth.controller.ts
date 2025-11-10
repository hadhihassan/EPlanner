import { Request, Response } from 'express';
import { AuthUseCase } from '../../usecase/authUsecase.js';
import { catchAsync } from '../../middlewares/catchAsync.js';

export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const result = await this.authUseCase.register(name, email, password, role);
    res.status(201).json(result);
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authUseCase.login(email, password);
    res.json(result);
  });

  me = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const user = await this.authUseCase.me(userId);
    res.json({ user });
  });
}
