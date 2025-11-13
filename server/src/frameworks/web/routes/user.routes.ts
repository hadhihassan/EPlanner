import { Router } from 'express';
import { container } from '../../config/container.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { UserController } from '../../../adapters/controllers/user.controller.js';

const router = Router();
const controller: UserController = container.resolve('userController');

router.use(authMiddleware);

router.get('/:id', controller.getUserById);
router.post('/by-ids', controller.getUsersByIds);

export default router;
