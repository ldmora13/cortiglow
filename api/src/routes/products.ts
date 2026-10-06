import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import apicache from 'apicache';

const router = Router();
const cache = apicache.middleware;

// Las rutas delegan todo al Controlador
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export default router;
