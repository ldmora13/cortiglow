import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import apicache from 'apicache';
import { requireAdmin, requireAuth } from '../utils/auth';

const router = Router();
const cache = apicache.middleware;

// Las rutas delegan todo al Controlador
router.get('/', (req, res, next) => {
  if (req.query.includeInactive === 'true') {
    return requireAuth(req, res, (error?: unknown) => {
      if (error) return next(error);
      return requireAdmin(req, res, next);
    });
  }
  next();
}, productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.patch('/:id/status', requireAuth, requireAdmin, productController.setStatus);

export default router;
