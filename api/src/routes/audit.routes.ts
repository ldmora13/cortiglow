import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';

const router = Router();

// Endpoint para obtener los logs (protegido por middleware de auth/admin en index.ts o el frontend)
router.get('/', auditController.getLogs.bind(auditController));

export default router;
