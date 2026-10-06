import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class InventoryRepository {
  async findAll() {
    return prisma.inventory.findMany({
      where: { product: { is_active: true } },
      include: {
        product: { include: { category: true } }
      },
      orderBy: { updated_at: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
      include: {
        product: { include: { category: true } },
        movements: { orderBy: { created_at: 'desc' }, take: 10 }
      }
    });
  }

  async findByProductId(productId: string) {
    return prisma.inventory.findUnique({
      where: { product_id: productId },
      include: {
        product: true,
        movements: { orderBy: { created_at: 'desc' }, take: 5 }
      }
    });
  }

  async create(data: Prisma.InventoryUncheckedCreateInput, performedBy?: string) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.create({
        data: {
          ...data,
          last_restock: data.quantity && data.quantity > 0 ? new Date() : null
        },
        include: { product: true }
      });

      if (data.quantity && data.quantity > 0) {
        await tx.inventoryMovement.create({
          data: {
            inventory_id: inventory.id,
            type: 'IN',
            quantity: data.quantity,
            reason: 'Stock inicial',
            performed_by: performedBy || null
          }
        });
      }

      return inventory;
    });
  }

  async updateSettings(id: string, minStock: number, location: string) {
    return prisma.inventory.update({
      where: { id },
      data: { min_stock: minStock, location },
      include: { product: true }
    });
  }

  async adjustStock(id: string, newQuantity: number, diffQuantity: number, reason: string, notes: string, performedBy: string) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { id } });
      if (!inventory) throw new Error('Inventario no encontrado');

      const updatedInventory = await tx.inventory.update({
        where: { id },
        data: {
          quantity: newQuantity,
          last_restock: diffQuantity > 0 ? new Date() : inventory.last_restock
        },
        include: { product: true }
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          inventory_id: id,
          type: 'ADJUSTMENT',
          quantity: diffQuantity,
          reason,
          notes,
          performed_by: performedBy
        }
      });

      return { inventory: updatedInventory, movement };
    });
  }

  async delete(id: string) {
    throw new Error('No se puede eliminar un inventario directamente. El inventario se oculta al eliminar el producto asociado.');
  }

  async getProductsWithoutInventory() {
    return prisma.product.findMany({
      where: { inventory: null, is_active: true }
    });
  }

  async initializeMissingInventories(products: any[]) {
    return Promise.all(
      products.map(product =>
        prisma.inventory.create({
          data: {
            product_id: product.id,
            quantity: 0,
            min_stock: 5,
            location: null
          }
        })
      )
    );
  }
}

export const inventoryRepository = new InventoryRepository();
