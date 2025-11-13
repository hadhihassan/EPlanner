import { Request, Response } from 'express';
import { AuthUseCase } from '../../usecase/auth.usecase.js';
import { catchAsync } from '../../middlewares/catchAsync.js';

export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) { }

  register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const result = await this.authUseCase.register({ name, email, password, role });

    res.status(201).json({
      user: result?.user,
      accessToken: result?.accessToken,
      refreshToken: result?.refreshToken
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authUseCase.login(email, password);
    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  });

  me = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const user = await this.authUseCase.me(userId);
    res.json({ user });
  });

  refresh = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await this.authUseCase.refresh(refreshToken);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  });
}
