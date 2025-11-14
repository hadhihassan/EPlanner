import { Request, Response } from 'express';
import { NotificationUseCase } from '../../usecase/notification.usecase.js';
import { catchAsync } from '../../middlewares/catchAsync.js';

export class NotificationController {
  constructor(private readonly notificationUseCase: NotificationUseCase) { }

  list = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { read, page, limit } = req.query;

    const filters: any = {};
    if (read !== undefined) filters.read = read === 'true';
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);

    const result = await this.notificationUseCase.list(user.id, filters);
    res.json(result);
  });

  getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const count = await this.notificationUseCase.getUnreadCount(user.id);
    res.json({ count });
  });

  markAsRead = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;
    const notification = await this.notificationUseCase.markAsRead(id, user.id);
    res.json(notification);
  });

  markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const count = await this.notificationUseCase.markAllAsRead(user.id);
    res.json({ count });
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;
    await this.notificationUseCase.delete(id, user.id);
    res.json({ success: true });
  });
}

