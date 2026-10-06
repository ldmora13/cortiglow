import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up categories that are NOT in the implementation plan...');

  // Valid slugs based on seed.ts
  const validSlugs = [
    'iluminacion',
    'iluminacion-techo',
    'iluminacion-pared-interior',
    'iluminacion-mesa-pie',
    'iluminacion-exterior',
    'tecnologia-led-smart',
    'lamparas-colgantes',
    'lamparas-techo',
    'downlights-balas',
    'rieles-focos',
    'paneles-led',
    'apliques-pared',
    'lamparas-pie-decorativas',
    'lamparas-mesa',
    'lamparas-escritorio',
    'faroles-apliques-exterior',
    'estacas-reflectores',
    'iluminacion-solar',
    'iluminacion-sumergible',
    'tiras-led',
    'bombillos-vintage',
    'bombillos-smart',
    'cortinas',
    'persianas-vanguardia',
    'cortinas-clasicas',
    'persianas-verticales-cat',
    'sistemas-especializados',
    'persianas-roller',
    'sheer-elegance',
    'paneles-japoneses',
    'cortinas-tradicionales',
    'cortinas-blackout',
    'cortinas-romanas',
    'persianas-verticales',
    'sistemas-motorizados',
    'toldos-exteriores',
    'pergolas-cubiertas',
  ];

  const allCategories = await prisma.category.findMany();

  const toDelete = allCategories.filter((c) => !validSlugs.includes(c.slug));

  console.log(`Found ${toDelete.length} categories to delete.`);

  // First, if any product is in a category to be deleted, move it to a safe valid category 
  // (e.g. 'iluminacion' or 'cortinas' depending on parent, or just 'iluminacion' as fallback)
  const safeCategory = await prisma.category.findUnique({ where: { slug: 'iluminacion' } });
  
  if (safeCategory) {
    for (const cat of toDelete) {
        await prisma.product.updateMany({
            where: { category_id: cat.id },
            data: { category_id: safeCategory.id }
        });
    }
  }

  // Delete from bottom up to avoid FK constraint errors with children
  let deletedCount = 0;
  let remainingToDelete = [...toDelete];
  let maxIterations = 5;

  while (remainingToDelete.length > 0 && maxIterations > 0) {
    const nextRemaining = [];
    for (const cat of remainingToDelete) {
      try {
        await prisma.category.delete({ where: { id: cat.id } });
        deletedCount++;
        console.log(`Deleted: ${cat.name}`);
      } catch (e) {
        // Probably has children that need to be deleted first
        nextRemaining.push(cat);
      }
    }
    remainingToDelete = nextRemaining;
    maxIterations--;
  }

  if (remainingToDelete.length > 0) {
    console.error(`Could not delete ${remainingToDelete.length} categories due to constraints.`);
  } else {
    console.log(`Successfully deleted ${deletedCount} obsolete categories.`);
  }

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
