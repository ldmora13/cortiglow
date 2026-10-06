import { categoryRepository } from '../repositories/category.repository';
import { auditService } from './audit.service';

interface CategoryPayload {
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: string | null;
}

export class CategoryService {
  
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(data: any, userId: string = 'SYSTEM') {
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const result = await categoryRepository.create(data);
    await auditService.logAction('CATEGORY', result.id, 'CREATE', userId, null, result);
    return result;
  }

  async updateCategory(id: string, data: any, userId: string = 'SYSTEM') {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new Error('Category not found');
    
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const updated = await categoryRepository.update(id, data);
    await auditService.logAction('CATEGORY', id, 'UPDATE', userId, existing, updated);
    return updated;
  }

  async deleteCategory(id: string, userId: string = 'SYSTEM') {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new Error('Category not found');
    
    try {
      await categoryRepository.delete(id);
      await auditService.logAction('CATEGORY', id, 'DELETE', userId, existing, { is_active: false });
      return { success: true };
    } catch (error) {
      throw new Error('Error deleting category. It might have subcategories or products linked.');
    }
  }
}

export const categoryService = new CategoryService();
