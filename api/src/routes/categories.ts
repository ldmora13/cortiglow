import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import apicache from 'apicache';

const router = Router();
const cache = apicache.middleware;

// Las rutas ahora son delgadas y delegan el trabajo al Controlador
router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
