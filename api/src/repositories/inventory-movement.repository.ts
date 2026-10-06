import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class InventoryMovementRepository {
  async findAll(filters: any, limit: number = 50) {
    return prisma.inventoryMovement.findMany({
      where: filters,
      include: {
        inventory: {
          include: {
            product: {
              select: { id: true, name: true, images: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  async findById(id: string) {
    return prisma.inventoryMovement.findUnique({
      where: { id },
      include: {
        inventory: {
          include: { product: true }
        }
      }
    });
  }

  async createMovementAndAdjustInventory(data: Prisma.InventoryMovementUncheckedCreateInput, newQuantity: number) {
    return prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({ data });

      const inventory = await tx.inventory.findUnique({ where: { id: data.inventory_id } });
      
      const updatedInventory = await tx.inventory.update({
        where: { id: data.inventory_id },
        data: {
          quantity: newQuantity,
          last_restock: data.type === 'IN' ? new Date() : (inventory ? inventory.last_restock : undefined)
        }
      });

      return { movement, inventory: updatedInventory };
    });
  }

  async getStats(where: any) {
    const [totalIn, totalOut, totalAdjustments] = await Promise.all([
      prisma.inventoryMovement.count({ where: { ...where, type: 'IN' } }),
      prisma.inventoryMovement.count({ where: { ...where, type: 'OUT' } }),
      prisma.inventoryMovement.count({ where: { ...where, type: 'ADJUSTMENT' } })
    ]);

    return {
      total_entries: totalIn,
      total_exits: totalOut,
      total_adjustments: totalAdjustments,
      total_movements: totalIn + totalOut + totalAdjustments
    };
  }
}

export const inventoryMovementRepository = new InventoryMovementRepository();
