import { Router } from 'express';
import { finishController } from '../controllers/finish.controller';

const router = Router();

router.get('/', finishController.getAll);
router.get('/:id', finishController.getById);
router.post('/', finishController.create);
router.put('/:id', finishController.update);
router.delete('/:id', finishController.delete);

export default router;
