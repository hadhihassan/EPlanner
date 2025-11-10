import { Router } from 'express';
import { container } from '../../config/container.js';
import { AuthController } from '../../../adapters/controllers/auth.controller.js';

const router = Router();
const controller: AuthController = container.resolve('authController');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', controller.me);

export default router;
