import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Renaming categories to match implementation plan EXACTLY...');

  // Update Cortinas L2
  await prisma.category.updateMany({
    where: { slug: 'persianas-vanguardia' },
    data: { name: 'Persianas Modernas' }
  });

  await prisma.category.updateMany({
    where: { slug: 'sistemas-especializados' },
    data: { name: 'Sistemas Especializados y Exteriores' }
  });

  console.log('✅ Categories renamed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
