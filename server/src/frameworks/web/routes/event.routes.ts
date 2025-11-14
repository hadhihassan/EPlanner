import { Router } from 'express';
import { container } from '../../config/container.js';
import { EventController } from '../../../adapters/controllers/events.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize } from '../../../adapters/repositories/rbac.repo.js';
import multer from 'multer';

const router = Router();
const controller: EventController = container.resolve('eventController');
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);
router.get('/', controller.list);
router.get('/:id', controller.getById);

// Organizer and Admin routes
router.post('/', authorize('organizer', 'admin'), upload.array('files'), controller.create);
router.put('/:id', authorize('organizer', 'admin'), upload.array('files'), controller.update);
router.delete('/:id', authorize('organizer', 'admin'), controller.remove);
router.get('/:id/eligible-users', authorize('organizer', 'admin'), controller.listEligibleUsers);
router.patch('/:id/add-participants', authorize('organizer', 'admin'), controller.addParticipants);

export default router;
