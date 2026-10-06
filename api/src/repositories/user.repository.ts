import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findAll() {
    return prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      where: {
        is_active: true
      }
    });
  }

  async findById(id: string) {
    return prisma.profile.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.profile.findFirst({
      where: { 
        email,
        is_active: true
      }
    });
  }

  async create(data: Prisma.ProfileUncheckedCreateInput) {
    return prisma.profile.create({
      data,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true
      }
    });
  }

  async update(id: string, data: Prisma.ProfileUncheckedUpdateInput) {
    return prisma.profile.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        updated_at: true
      }
    });
  }

  async delete(id: string) {
    const user = await prisma.profile.findUnique({ where: { id } });
    if (!user) return null;

    return prisma.profile.update({
      where: { id },
      data: { 
        is_active: false,
        email: `${user.email}_deleted_${Date.now()}`
      }
    });
  }
}

export const userRepository = new UserRepository();
