import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSkuFromName(name: string, index: number): string {
  // Ej: "Persiana Blackout" -> "PERS-0001"
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = cleanName.substring(0, 4).padEnd(4, 'X');
  const numericSuffix = String(index + 1).padStart(4, '0');
  return `${prefix}-${numericSuffix}`;
}

async function migrate() {
  console.log('Fetching products without SKU...');
  const products = await prisma.product.findMany({
    where: { OR: [{ sku: null }, { sku: '' }] }
  });

  console.log(`Found ${products.length} products to update.`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let newSku = generateSkuFromName(p.name, i);
    
    // Check if generated SKU already exists
    let skuExists = true;
    let attempt = 0;
    while (skuExists) {
      const existing = await prisma.product.findUnique({ where: { sku: newSku } });
      if (existing) {
        attempt++;
        newSku = `${newSku.split('-')[0]}-${String(i + 1 + attempt * 1000).padStart(4, '0')}`;
      } else {
        skuExists = false;
      }
    }

    await prisma.product.update({
      where: { id: p.id },
      data: { sku: newSku }
    });
    console.log(`Updated [${p.name}] with SKU: ${newSku}`);
  }

  console.log('Migration complete!');
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
