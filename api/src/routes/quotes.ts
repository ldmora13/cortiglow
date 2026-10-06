import { Router } from 'express';
import { quoteController } from '../controllers/quote.controller';

const router = Router();

router.get('/', quoteController.getAll);
router.get('/:id', quoteController.getById);
router.post('/', quoteController.create);
router.put('/:id', quoteController.update);
router.delete('/:id', quoteController.delete);
router.patch('/:id/status', quoteController.updateStatus);
router.post('/:id/convert-to-order', quoteController.convertToOrder);

export default router;
