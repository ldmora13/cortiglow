import { Request, Response } from 'express';
import { auditService } from '../services/audit.service';

export class AuditController {
  async getLogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const filters = {
        entity_type: req.query.entity_type,
        action: req.query.action,
        performed_by: req.query.performed_by,
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };

      const result = await auditService.getLogs(page, limit, filters);
      res.json(result);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Error al obtener registros de auditoría' });
    }
  }
}

export const auditController = new AuditController();
