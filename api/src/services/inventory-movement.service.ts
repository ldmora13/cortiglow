import { inventoryMovementRepository } from '../repositories/inventory-movement.repository';
import { inventoryRepository } from '../repositories/inventory.repository';

export class InventoryMovementService {
  async getAllMovements(filters: any, limit: number = 50) {
    return await inventoryMovementRepository.findAll(filters, limit);
  }

  async getMovementById(id: string) {
    const movement = await inventoryMovementRepository.findById(id);
    if (!movement) {
      throw new Error('Movimiento no encontrado');
    }
    return movement;
  }

  async createMovement(data: any) {
    const { inventory_id, type, quantity, reason, notes, performed_by } = data;

    if (!inventory_id || !type || quantity === undefined || !reason) {
      throw new Error('Faltan campos requeridos');
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      throw new Error('Tipo de movimiento inválido');
    }

    const inventory = await inventoryRepository.findById(inventory_id);
    if (!inventory) {
      throw new Error('Inventario no encontrado');
    }

    let quantityChange = 0;
    if (type === 'IN') {
      quantityChange = Math.abs(quantity);
    } else if (type === 'OUT') {
      quantityChange = -Math.abs(quantity);
    } else if (type === 'ADJUSTMENT') {
      quantityChange = quantity;
    }

    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error('Stock insuficiente para esta operación');
    }

    const movementData = {
      inventory_id,
      type,
      quantity: quantityChange,
      reason,
      notes,
      performed_by
    };

    return await inventoryMovementRepository.createMovementAndAdjustInventory(movementData, newQuantity);
  }

  async getSummary(filters: any) {
    return await inventoryMovementRepository.getStats(filters);
  }
}

export const inventoryMovementService = new InventoryMovementService();
