import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const prods = await prisma.product.findMany();
  const cats = await prisma.category.findMany();
  
  console.log('Products:', prods.length);
  if (prods.length === 0) return;
  
  const prod = prods[0];
  console.log('Product category_id:', prod.category_id);
  
  const targetCategory = cats.find(c => c.slug === 'iluminacion');
  if (!targetCategory) return console.log('No target cat iluminacion');
  
  const getDesc = (pid: string): string[] => {
    const ch = cats.filter(c => c.parent_id === pid);
    let ids: string[] = [];
    for (let c of ch) {
      ids.push(c.id);
      ids = ids.concat(getDesc(c.id));
    }
    return ids;
  };
  
  const valid = [targetCategory.id, ...getDesc(targetCategory.id)];
  console.log('Valid category ids length:', valid.length);
  console.log('Does valid ids include product?', prod.category_id ? valid.includes(prod.category_id) : false);
  
  const prodCat = cats.find(c => c.id === prod.category_id);
  console.log('Product category name:', prodCat?.name);
  console.log('Product category parent_id:', prodCat?.parent_id);
  
  if (prodCat?.parent_id) {
     const parent = cats.find(c => c.id === prodCat.parent_id);
     console.log('Parent category name:', parent?.name, 'parent_id:', parent?.parent_id);
  }
}

run().finally(() => prisma.$disconnect());
