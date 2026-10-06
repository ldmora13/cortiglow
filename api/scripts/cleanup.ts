import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.category.deleteMany({ where: { image_url: null } })
  .then(() => console.log('Cleaned ghosts'))
  .finally(() => prisma.$disconnect());
