import { auditRepository } from '../repositories/audit.repository';

export class AuditService {
  async logAction(
    entityType: string,
    entityId: string,
    action: string,
    performedBy: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string
  ) {
    try {
      if (!performedBy) return; // Si no hay usuario (ej: proceso automático), podemos omitir o guardar como 'SYSTEM'

      // Evitamos guardar JSONs gigantes si son iguales, pero por ahora guardamos todo
      await auditRepository.createLog({
        entity_type: entityType,
        entity_id: entityId,
        action,
        performed_by: performedBy,
        old_values: oldValues ? oldValues : undefined,
        new_values: newValues ? newValues : undefined,
        ip_address: ipAddress
      });
    } catch (error) {
      console.error('Error saving audit log:', error);
      // No bloqueamos la ejecución principal si el log falla
    }
  }

  async getLogs(page: number = 1, limit: number = 50, filters: any = {}) {
    const skip = (page - 1) * limit;
    
    // Parsear filtros de fecha si existen
    const dbFilters: any = {};
    if (filters.entity_type) dbFilters.entity_type = filters.entity_type;
    if (filters.action) dbFilters.action = filters.action;
    if (filters.performed_by) dbFilters.performed_by = filters.performed_by;
    
    if (filters.date_from || filters.date_to) {
      dbFilters.created_at = {};
      if (filters.date_from) dbFilters.created_at.gte = new Date(filters.date_from);
      if (filters.date_to) dbFilters.created_at.lte = new Date(filters.date_to);
    }

    const [data, total] = await Promise.all([
      auditRepository.getLogs(dbFilters, limit, skip),
      auditRepository.getLogCount(dbFilters)
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

export const auditService = new AuditService();
