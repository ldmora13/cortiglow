import { productRepository } from '../repositories/product.repository';
import { auditService } from './audit.service';
import crypto from 'crypto';

interface ProductPayload {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost?: number;
  images?: string[];
  video_url?: string;
  category_id?: string;
  provider_id?: string;
  min_stock?: number;
}

export class ProductService {
  async getAllProducts() {
    return await productRepository.findAll();
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async generateSku(name: string, providedSku?: string): Promise<string> {
    if (providedSku && providedSku.trim() !== '') {
      return providedSku;
    }
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = cleanName.substring(0, 4).padEnd(4, 'X');
    
    const lastSeq = await productRepository.findHighestSequenceByPrefix(prefix);
    const nextSeq = lastSeq + 1;
    const formattedSeq = nextSeq.toString().padStart(3, '0');
    
    return `${prefix}-${formattedSeq}`;
  }

  async createProduct(data: ProductPayload, userId: string = 'SYSTEM') {
    const finalSku = await this.generateSku(data.name, data.sku);
    
    const result = await productRepository.createWithInventory({
      name: data.name,
      sku: finalSku,
      description: data.description,
      price: data.price,
      cost: data.cost || 0,
      images: data.images || [],
      video_url: data.video_url,
      category_id: data.category_id || null,
      provider_id: data.provider_id || null
    }, data.min_stock);
    await auditService.logAction('PRODUCT', result.product.id, 'CREATE', userId, null, result.product);
    return result;
  }

  async updateProduct(id: string, data: ProductPayload, userId: string = 'SYSTEM') {
    const existing = await productRepository.findById(id);
    if (!existing) throw new Error('Product not found');
    
    const finalSku = await this.generateSku(data.name, data.sku);
    
    const updated = await productRepository.update(id, {
      name: data.name,
      sku: finalSku,
      description: data.description,
      price: data.price,
      cost: data.cost,
      images: data.images,
      video_url: data.video_url,
      category_id: data.category_id || null,
      provider_id: data.provider_id || null
    }, data.min_stock);
    await auditService.logAction('PRODUCT', id, 'UPDATE', userId, existing, updated);
    return updated;
  }

  async deleteProduct(id: string, userId: string = 'SYSTEM') {
    const existing = await productRepository.findById(id);
    if (!existing) throw new Error('Product not found');
    
    await productRepository.delete(id);
    await auditService.logAction('PRODUCT', id, 'DELETE', userId, existing, { is_active: false });
    return { success: true };
  }
}

export const productService = new ProductService();
