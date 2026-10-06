import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { extractUserId } from '../utils/auth';

export class CategoryController {
  
  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: 'Error fetching categories' });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      res.json(category);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error fetching category' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const category = await categoryService.createCategory(req.body, userId);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: 'Error creating category' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const category = await categoryService.updateCategory(req.params.id, req.body, userId);
      res.json(category);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: 'Error updating category' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await categoryService.deleteCategory(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
}

export const categoryController = new CategoryController();
