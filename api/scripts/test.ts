import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.category.findMany().then(c => {
  console.log(c.map(x => ({slug: x.slug, img: x.image_url})));
}).finally(() => prisma.$disconnect());
