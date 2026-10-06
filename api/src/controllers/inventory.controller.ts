import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import apicache from 'apicache';
import { extractUserId } from '../utils/auth';

export class InventoryController {
  async getAll(req: Request, res: Response) {
    try {
      const lowStock = req.query.lowStock === 'true';
      const inventory = await inventoryService.getAllInventory(lowStock);
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ error: 'Error al obtener inventario' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const inventory = await inventoryService.getInventoryById(req.params.id);
      res.json(inventory);
    } catch (error: any) {
      if (error.message === 'Inventario no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al obtener inventario' });
      }
    }
  }

  async getByProductId(req: Request, res: Response) {
    try {
      const inventory = await inventoryService.getInventoryByProductId(req.params.productId);
      res.json(inventory);
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al obtener inventario' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const inventory = await inventoryService.createInventory(req.body, userId);
      apicache.clear('/api/inventory');
      res.status(201).json(inventory);
    } catch (error: any) {
      if (error.message.includes('Producto no encontrado')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Ya existe')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating inventory:', error);
        res.status(500).json({ error: 'Error al crear inventario' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const inventory = await inventoryService.updateSettings(req.params.id, req.body, userId);
      apicache.clear('/api/inventory');
      res.json(inventory);
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'Error al actualizar inventario' });
    }
  }

  async adjustStock(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await inventoryService.adjustStock(req.params.id, req.body, userId);
      apicache.clear('/api/inventory');
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Inventario no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('diferente de 0') || error.message.includes('razón') || error.message.includes('negativo')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error adjusting inventory:', error);
        res.status(500).json({ error: 'Error al ajustar inventario' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await inventoryService.deleteInventory(req.params.id, userId);
      apicache.clear('/api/inventory');
      res.json(result);
    } catch (error) {
      console.error('Error deleting inventory:', error);
      res.status(500).json({ error: 'Error al eliminar inventario' });
    }
  }

  async initialize(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await inventoryService.initializeInventory(userId);
      apicache.clear('/api/inventory');
      res.json(result);
    } catch (error) {
      console.error('Error initializing inventory:', error);
      res.status(500).json({ error: 'Error al inicializar inventario' });
    }
  }
}

export const inventoryController = new InventoryController();
