import { Router } from 'express';
import { container } from '../../config/container.js';
import { NotificationController } from '../../../adapters/controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller: NotificationController = container.resolve('notificationController');

router.use(authMiddleware);
router.get('/', controller.list);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/:id/read', controller.markAsRead);
router.patch('/read-all', controller.markAllAsRead);
router.delete('/:id', controller.delete);

export default router;

