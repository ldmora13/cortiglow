import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class FinishRepository {
  async findAll(activeOnly: boolean = true) {
    return prisma.finish.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return prisma.finish.findFirst({
      where: { id, is_active: true }
    });
  }

  async create(data: Prisma.FinishUncheckedCreateInput) {
    return prisma.finish.create({ data });
  }

  async update(id: string, data: Prisma.FinishUncheckedUpdateInput) {
    return prisma.finish.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.finish.update({
      where: { id },
      data: { is_active: false }
    });
  }
}

export const finishRepository = new FinishRepository();
