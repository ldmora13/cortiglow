import { providerRepository } from '../repositories/provider.repository';
import { auditService } from './audit.service';

interface ProviderPayload {
  name: string;
  nit?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  delivery_time?: string;
  notes?: string;
  is_active?: boolean;
}

export class ProviderService {
  async getAllProviders() {
    return await providerRepository.findAll();
  }

  async getProviderById(id: string) {
    const provider = await providerRepository.findById(id);
    if (!provider) {
      throw new Error('Provider not found');
    }
    return provider;
  }

  async createProvider(data: ProviderPayload, userId: string = 'SYSTEM') {
    const provider = await providerRepository.create({
      name: data.name,
      nit: data.nit,
      contact_name: data.contact_name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      delivery_time: data.delivery_time,
      notes: data.notes,
      is_active: data.is_active ?? true
    });
    
    await auditService.logAction('PROVIDER', provider.id, 'CREATE', userId, null, provider);
    return provider;
  }

  async updateProvider(id: string, data: ProviderPayload, userId: string = 'SYSTEM') {
    const existing = await providerRepository.findById(id);
    if (!existing) throw new Error('Provider not found');

    const updated = await providerRepository.update(id, {
      name: data.name,
      nit: data.nit,
      contact_name: data.contact_name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      delivery_time: data.delivery_time,
      notes: data.notes,
      is_active: data.is_active
    });

    await auditService.logAction('PROVIDER', id, 'UPDATE', userId, existing, updated);
    return updated;
  }

  async deleteProvider(id: string, userId: string = 'SYSTEM') {
    const existing = await providerRepository.findById(id);
    if (existing) {
      await providerRepository.delete(id);
      await auditService.logAction('PROVIDER', id, 'DELETE', userId, existing, { is_active: false });
    }
    return { success: true };
  }
}

export const providerService = new ProviderService();
