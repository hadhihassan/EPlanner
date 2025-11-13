import { Request, Response } from 'express';
import { UserUseCase } from '../../usecase/user.usecase.js';
import { catchAsync } from '../../middlewares/catchAsync.js';

export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  getUserById = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userUseCase.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });

  getUsersByIds = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body; 
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty user IDs' });
    }
    const users = await this.userUseCase.getUsersByIds(ids);
    res.json(users);
  });
}
