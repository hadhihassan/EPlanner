import { Request, Response } from 'express';
import { MessageUseCase } from '../../usecase/message.usecase.js';
import { catchAsync } from '../../middlewares/catchAsync.js';

export class MessageController {
  constructor(private messageUseCase: MessageUseCase) {}

  getMessages = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const messages = await this.messageUseCase.getEventMessages(eventId);
    res.json(messages);
  });

  sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { text } = req.body;
    const user = (req as any).user;

    const message = await this.messageUseCase.sendMessage({
      eventId,
      userId: user.id,
      text,
    });

    res.status(201).json(message);
  });
}
