import { Router } from 'express';
import { container } from '../../config/container.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { MessageController } from '../../../adapters/controllers/message.controller.js';

const router = Router();
const controller: MessageController = container.resolve('messageController');

router.use(authMiddleware);

router.get('/:eventId', controller.getMessages);
router.post('/:eventId', controller.sendMessage);

export default router;
