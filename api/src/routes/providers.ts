import { Router } from 'express';
import { providerController } from '../controllers/provider.controller';

const router = Router();

router.get('/', providerController.getAll.bind(providerController));
router.get('/:id', providerController.getById.bind(providerController));
router.post('/', providerController.create.bind(providerController));
router.put('/:id', providerController.update.bind(providerController));
router.delete('/:id', providerController.delete.bind(providerController));

export default router;
