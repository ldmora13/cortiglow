import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ProviderRepository {
  async findAll() {
    return prisma.provider.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.provider.findFirst({
      where: { id, is_active: true }
    });
  }

  async create(data: Prisma.ProviderCreateInput) {
    return prisma.provider.create({
      data
    });
  }

  async update(id: string, data: Prisma.ProviderUpdateInput) {
    return prisma.provider.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.provider.update({
      where: { id },
      data: { is_active: false }
    });
  }
}

export const providerRepository = new ProviderRepository();
