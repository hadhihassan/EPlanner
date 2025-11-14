import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import messageRoutes from './message.routes.js';
import userRoutes from './user.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/event', eventRoutes);
router.use('/message', messageRoutes);
router.use('/user', userRoutes);
router.use('/notification', notificationRoutes);

export default router;
