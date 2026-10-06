import { Router } from 'express';
import { requireAuth, requireAdmin } from '../utils/auth';
import { userController } from '../controllers/user.controller';

const router = Router();

// Apply authentication to all user routes
router.use(requireAuth);

// Delegate to the Controller
router.get('/', requireAdmin, userController.getAll);
router.post('/', requireAdmin, userController.create);
router.put('/:id', requireAdmin, userController.update);
router.put('/:id/password', requireAdmin, userController.updatePassword);
router.delete('/:id', requireAdmin, userController.delete);

export default router;
