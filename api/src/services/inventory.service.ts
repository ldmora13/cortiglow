import { inventoryRepository } from '../repositories/inventory.repository';
import prisma from '../prisma';
import { auditService } from './audit.service';

export class InventoryService {
  private formatInventoryWithAlert(inventory: any) {
    return {
      ...inventory,
      is_low_stock: inventory.quantity <= inventory.min_stock,
      alert_level: inventory.quantity === 0 ? 'critical' : inventory.quantity <= inventory.min_stock ? 'warning' : 'normal'
    };
  }

  async getAllInventory(lowStock: boolean) {
    const inventory = await inventoryRepository.findAll();
    
    const filteredInventory = lowStock
      ? inventory.filter(inv => inv.quantity <= inv.min_stock)
      : inventory;

    return filteredInventory.map(this.formatInventoryWithAlert);
  }

  async getInventoryById(id: string) {
    const inventory = await inventoryRepository.findById(id);
    if (!inventory) throw new Error('Inventario no encontrado');
    return this.formatInventoryWithAlert(inventory);
  }

  async getInventoryByProductId(productId: string) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory) throw new Error('Inventario no encontrado para este producto');
    return inventory;
  }

  async createInventory(data: any, userId: string = 'SYSTEM') {
    const product = await prisma.product.findUnique({ where: { id: data.product_id } });
    if (!product) throw new Error('Producto no encontrado');

    const existingInventory = await inventoryRepository.findByProductId(data.product_id);
    if (existingInventory) throw new Error('Ya existe un inventario para este producto');

    const created = await inventoryRepository.create(data, data.performed_by);
    await auditService.logAction('INVENTORY', created.id, 'CREATE', userId, null, created);
    return created;
  }

  async updateSettings(id: string, data: any, userId: string = 'SYSTEM') {
    const existing = await inventoryRepository.findById(id);
    const updated = await inventoryRepository.updateSettings(id, data.min_stock, data.location);
    await auditService.logAction('INVENTORY', id, 'UPDATE', userId, existing, updated);
    return updated;
  }

  async adjustStock(id: string, data: any, userId: string = 'SYSTEM') {
    const { quantity, reason, notes, performed_by } = data;

    if (!quantity || quantity === 0) throw new Error('La cantidad debe ser diferente de 0');
    if (!reason) throw new Error('Debe proporcionar una razón para el ajuste');

    const inventory = await inventoryRepository.findById(id);
    if (!inventory) throw new Error('Inventario no encontrado');

    const newQuantity = inventory.quantity + quantity;
    if (newQuantity < 0) throw new Error('El ajuste resultaría en stock negativo');

    const updated = await inventoryRepository.adjustStock(id, newQuantity, quantity, reason, notes, performed_by);
    await auditService.logAction('INVENTORY', id, 'ADJUST_STOCK', userId, inventory, updated);
    return updated;
  }

  async deleteInventory(id: string, userId: string = 'SYSTEM') {
    const existing = await inventoryRepository.findById(id);
    await inventoryRepository.delete(id);
    if (existing) await auditService.logAction('INVENTORY', id, 'DELETE', userId, existing, { is_active: false });
    return { message: 'Inventario eliminado correctamente' };
  }

  async initializeInventory(userId: string = 'SYSTEM') {
    const productsWithoutInventory = await inventoryRepository.getProductsWithoutInventory();
    
    if (productsWithoutInventory.length === 0) {
      return { message: 'Todos los productos ya tienen inventario', created: 0 };
    }

    const inventoryRecords = await inventoryRepository.initializeMissingInventories(productsWithoutInventory);
    for (const record of inventoryRecords) {
      await auditService.logAction('INVENTORY', record.id, 'CREATE', userId, null, record);
    }
    return { 
      message: `Inventario inicializado para ${inventoryRecords.length} productos`,
      created: inventoryRecords.length 
    };
  }
}

export const inventoryService = new InventoryService();
