import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ProductRepository {
  async findAll(includeInactive = false) {
    return prisma.product.findMany({
      where: includeInactive ? undefined : { is_active: true },
      orderBy: { created_at: 'desc' },
      include: { 
        category: true,
        inventory: true,
        provider: true
      }
    });
  }

  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, is_active: true },
      include: { 
        category: true,
        inventory: true,
        provider: true
      }
    });
  }

  async findByIdIncludingInactive(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true,
        provider: true
      }
    });
  }

  async findHighestSequenceByPrefix(prefix: string) {
    const products = await prisma.product.findMany({
      where: {
        sku: {
          startsWith: `${prefix}-`
        }
      },
      select: { sku: true }
    });

    let maxSeq = 0;
    for (const p of products) {
      if (p.sku) {
        const parts = p.sku.split('-');
        if (parts.length === 2 && parts[0] === prefix) {
          const seq = parseInt(parts[1], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    }
    return maxSeq;
  }

  async createWithInventory(productData: Prisma.ProductUncheckedCreateInput, minStock: number = 5) {
    return prisma.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: productData
      });

      const inventory = await tx.inventory.create({
        data: {
          product_id: product.id,
          quantity: 0,
          min_stock: minStock,
          location: null
        }
      });

      return { product, inventory };
    });
  }

  async update(id: string, data: Prisma.ProductUncheckedUpdateInput, minStock?: number) {
    return prisma.$transaction(async (tx: any) => {
      const product = await tx.product.update({
        where: { id },
        data
      });

      if (minStock !== undefined) {
        await tx.inventory.updateMany({
          where: { product_id: id },
          data: { min_stock: minStock }
        });
      }

      return product;
    });
  }

  async setActive(id: string, isActive: boolean) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        include: { inventory: true }
      });

      if (!product) return null;
      if (!isActive && (product.inventory?.quantity ?? 0) > 0) {
        throw new Error('No se puede desactivar un producto con stock disponible');
      }

      return tx.product.update({
        where: { id },
        data: { is_active: isActive }
      });
    });
  }
}

export const productRepository = new ProductRepository();
