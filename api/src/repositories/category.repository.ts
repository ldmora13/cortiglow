import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class CategoryRepository {
  
  async findAll() {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      include: {
        children: {
          where: { is_active: true }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    const getRecursiveProductCount = (categoryId: string): number => {
      const cat = categories.find(c => c.id === categoryId);
      if (!cat) return 0;
      
      let count = cat._count.products;
      const children = categories.filter(c => c.parent_id === categoryId);
      for (const child of children) {
        count += getRecursiveProductCount(child.id);
      }
      return count;
    };

    return categories.map(c => ({
      ...c,
      product_count: getRecursiveProductCount(c.id)
    }));
  }

  async findBySlug(slug: string) {
    const category = await prisma.category.findFirst({
      where: { slug, is_active: true },
      include: { 
        children: {
          where: { is_active: true }
        },
        _count: { select: { products: true } }
      }
    });

    if (!category) return null;

    return {
      ...category,
      product_count: category._count.products
    };
  }

  async findById(id: string) {
    const category = await prisma.category.findFirst({
      where: { id, is_active: true }
    });
    return category;
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({
      data
    });
  }

  async update(id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return prisma.category.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return null;

    return prisma.category.update({
      where: { id },
      data: { 
        is_active: false,
        slug: `${category.slug}_deleted_${Date.now()}`
      }
    });
  }
}

export const categoryRepository = new CategoryRepository();
