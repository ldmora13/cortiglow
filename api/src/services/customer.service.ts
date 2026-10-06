import { customerRepository } from '../repositories/customer.repository';
import { auditService } from './audit.service';

interface CustomerPayload {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  department?: string;
  document_type?: string;
  document_number?: string;
  notes?: string;
}

export class CustomerService {
  async getAllCustomers(search?: string, limit: number = 100) {
    const customers = await customerRepository.findAll(search, limit);
    
    return customers.map(customer => ({
      ...customer,
      total_orders: customer.orders.length,
      total_spent: customer.orders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + Number(o.total), 0)
    }));
  }

  async getCustomerById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    const stats = {
      total_orders: customer.orders.length,
      completed_orders: customer.orders.filter((o: any) => o.status === 'completed').length,
      pending_orders: customer.orders.filter((o: any) => o.status === 'pending').length,
      cancelled_orders: customer.orders.filter((o: any) => o.status === 'cancelled').length,
      total_spent: customer.orders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + Number(o.total), 0),
      last_order_date: customer.orders[0]?.created_at || null
    };

    return { ...customer, stats };
  }

  async createCustomer(data: CustomerPayload, userId: string = 'SYSTEM') {
    if (!data.name || !data.phone) {
      throw new Error('Nombre y teléfono son requeridos');
    }

    if (data.phone) {
      const existingCustomer = await customerRepository.findByPhone(data.phone);
      if (existingCustomer) {
        throw new Error('Ya existe un cliente con este teléfono');
      }
    }

    if (data.email) {
      const existingCustomer = await customerRepository.findByEmail(data.email);
      if (existingCustomer) {
        throw new Error('Ya existe un cliente con este email');
      }
    }

    const result = await customerRepository.create(data as any);
    await auditService.logAction('CUSTOMER', result.id, 'CREATE', userId, null, result);
    return result;
  }

  async updateCustomer(id: string, data: CustomerPayload, userId: string = 'SYSTEM') {
    const existingCustomer = await customerRepository.findById(id);
    if (!existingCustomer) {
      throw new Error('Cliente no encontrado');
    }

    if (data.phone && data.phone !== existingCustomer.phone) {
      const customerWithPhone = await customerRepository.findByPhone(data.phone, id);
      if (customerWithPhone) {
        throw new Error('Ya existe un cliente con este teléfono');
      }
    }

    if (data.email && data.email !== existingCustomer.email) {
      const customerWithEmail = await customerRepository.findByEmail(data.email, id);
      if (customerWithEmail) {
        throw new Error('Ya existe un cliente con este email');
      }
    }

    const updated = await customerRepository.update(id, data as any);
    await auditService.logAction('CUSTOMER', id, 'UPDATE', userId, existingCustomer, updated);
    return updated;
  }

  async deleteCustomer(id: string, userId: string = 'SYSTEM') {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    if (customer.orders.length > 0) {
      throw new Error(`No se puede eliminar un cliente con órdenes registradas (${customer.orders.length} órdenes)`);
    }

    await customerRepository.delete(id);
    await auditService.logAction('CUSTOMER', id, 'DELETE', userId, customer, { is_active: false });
    return { message: 'Cliente eliminado correctamente' };
  }

  async getCustomerOrders(id: string, status?: string) {
    return await customerRepository.findCustomerOrders(id, status);
  }
}

export const customerService = new CustomerService();
