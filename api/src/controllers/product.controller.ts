import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import apicache from 'apicache';
import { extractUserId } from '../utils/auth';

export class ProductController {
  
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts(req.query.includeInactive === 'true');
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error fetching product' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await productService.createProduct(req.body, userId);
      apicache.clear('/api/products');
      apicache.clear('/api/inventory');
      res.json(result.product);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: 'Error creating product' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const product = await productService.updateProduct(req.params.id, req.body, userId);
      apicache.clear('/api/products');
      res.json(product);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: 'Error updating product' });
    }
  }

  async setStatus(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      if (typeof req.body.is_active !== 'boolean') {
        return res.status(400).json({ error: 'is_active debe ser booleano' });
      }
      const result = await productService.setProductActive(req.params.id, req.body.is_active, userId);
      apicache.clear('/api/products');
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      if (error.message.includes('stock disponible')) {
        return res.status(409).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({ error: 'Error al cambiar el estado del producto' });
    }
  }
}

export const productController = new ProductController();
