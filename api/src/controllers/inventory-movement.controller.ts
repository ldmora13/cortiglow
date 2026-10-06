import { Request, Response } from 'express';
import { inventoryMovementService } from '../services/inventory-movement.service';

export class InventoryMovementController {
  async getAll(req: Request, res: Response) {
    try {
      const { type, product_id, date_from, date_to, limit = '50' } = req.query;

      const filters: any = {};
      if (type) filters.type = type;
      if (product_id) filters.inventory = { product_id };

      if (date_from || date_to) {
        filters.created_at = {};
        if (date_from) filters.created_at.gte = new Date(date_from as string);
        if (date_to) filters.created_at.lte = new Date(date_to as string);
      }

      const movements = await inventoryMovementService.getAllMovements(filters, parseInt(limit as string));
      res.json(movements);
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      res.status(500).json({ error: 'Error al obtener movimientos de inventario' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const movement = await inventoryMovementService.getMovementById(req.params.id);
      res.json(movement);
    } catch (error: any) {
      if (error.message === 'Movimiento no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error fetching movement:', error);
        res.status(500).json({ error: 'Error al obtener movimiento' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await inventoryMovementService.createMovement(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'Faltan campos requeridos' || error.message === 'Tipo de movimiento inválido' || error.message === 'Stock insuficiente para esta operación') {
        res.status(400).json({ error: error.message });
      } else if (error.message === 'Inventario no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error creating movement:', error);
        res.status(500).json({ error: 'Error al registrar movimiento' });
      }
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const { date_from, date_to } = req.query;
      const filters: any = {};
      if (date_from || date_to) {
        filters.created_at = {};
        if (date_from) filters.created_at.gte = new Date(date_from as string);
        if (date_to) filters.created_at.lte = new Date(date_to as string);
      }

      const stats = await inventoryMovementService.getSummary(filters);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching movement stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
}

export const inventoryMovementController = new InventoryMovementController();
