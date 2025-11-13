import { Router } from 'express';
import { container } from '../../config/container.js';
import { AuthController } from '../../../adapters/controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller: AuthController = container.resolve('authController');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.get('/me', authMiddleware, controller.me);

export default router;
