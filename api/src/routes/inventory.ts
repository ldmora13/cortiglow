import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import apicache from 'apicache';

const router = Router();
const cache = apicache.middleware;

router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getById);
router.get('/product/:productId', inventoryController.getByProductId);
router.post('/', inventoryController.create);
router.put('/:id', inventoryController.update);
router.post('/:id/adjust', inventoryController.adjustStock);
router.delete('/:id', inventoryController.delete);
router.post('/initialize', inventoryController.initialize);

export default router;
