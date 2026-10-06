import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class AuditRepository {
  async createLog(data: Prisma.AuditLogUncheckedCreateInput) {
    return prisma.auditLog.create({
      data
    });
  }

  async getLogs(filters: any, limit: number = 100, skip: number = 0) {
    return prisma.auditLog.findMany({
      where: filters,
      include: {
        user: { select: { id: true, full_name: true, email: true, role: true } }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip
    });
  }

  async getLogCount(filters: any) {
    return prisma.auditLog.count({ where: filters });
  }
}

export const auditRepository = new AuditRepository();
