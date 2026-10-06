import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import apicache from 'apicache';

const router = Router();
const cache = apicache.middleware;

router.get('/', cache('1 minute'), orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.put('/:id/status', orderController.updateStatus);
router.delete('/:id', orderController.delete);
router.post('/:id/payments', orderController.registerPayment);

export default router;
