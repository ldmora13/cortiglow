import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class CustomerRepository {
  async findAll(search?: string, limit: number = 100) {
    const where: any = { is_active: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    return prisma.customer.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            order_number: true,
            total: true,
            status: true,
            created_at: true
          },
          orderBy: { created_at: 'desc' },
          take: 5
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  async findById(id: string) {
    return prisma.customer.findFirst({
      where: { id, is_active: true },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, images: true }
                }
              }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });
  }

  async findByPhone(phone: string, excludeId?: string) {
    const where: any = { phone, is_active: true };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    return prisma.customer.findFirst({ where });
  }

  async findByEmail(email: string, excludeId?: string) {
    const where: any = { email, is_active: true };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    return prisma.customer.findFirst({ where });
  }

  async create(data: Prisma.CustomerUncheckedCreateInput) {
    return prisma.customer.create({ data });
  }

  async update(id: string, data: Prisma.CustomerUncheckedUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.customer.update({
      where: { id },
      data: { is_active: false }
    });
  }

  async findCustomerOrders(customerId: string, status?: string) {
    const where: any = { customer_id: customerId };
    if (status) {
      where.status = status;
    }

    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }
}

export const customerRepository = new CustomerRepository();
