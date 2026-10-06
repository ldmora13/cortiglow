import { Router } from 'express';
import { inventoryMovementController } from '../controllers/inventory-movement.controller';

const router = Router();

router.get('/', inventoryMovementController.getAll);
router.get('/stats/summary', inventoryMovementController.getSummary);
router.get('/:id', inventoryMovementController.getById);
router.post('/', inventoryMovementController.create);

export default router;
