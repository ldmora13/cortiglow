import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const cats = await prisma.category.findMany();
  
  // Find top level (no parent)
  const topLevel = cats.filter(c => !c.parent_id);
  
  console.log("=== JERARQUIA DE CATEGORIAS ===");
  for (const t of topLevel) {
    console.log(`[L1] ${t.name}`);
    const l2 = cats.filter(c => c.parent_id === t.id);
    for (const sub of l2) {
      console.log(`  |- [L2] ${sub.name}`);
      const l3 = cats.filter(c => c.parent_id === sub.id);
      for (const subsub of l3) {
         console.log(`      |- [L3] ${subsub.name}`);
      }
    }
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
