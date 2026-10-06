import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { extractUserId } from '../utils/auth';

export class CustomerController {
  async getAll(req: Request, res: Response) {
    try {
      const search = req.query.search as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const customers = await customerService.getAllCustomers(search, limit);
      res.json(customers);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Error al obtener clientes' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      res.json(customer);
    } catch (error: any) {
      if (error.message === 'Cliente no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Error al obtener cliente' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const customer = await customerService.createCustomer(req.body, userId);
      res.status(201).json(customer);
    } catch (error: any) {
      if (error.message.includes('requeridos') || error.message.includes('Ya existe')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Error al crear cliente' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const customer = await customerService.updateCustomer(req.params.id, req.body, userId);
      res.json(customer);
    } catch (error: any) {
      if (error.message === 'Cliente no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Ya existe')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await customerService.deleteCustomer(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Cliente no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('No se puede eliminar')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Error al eliminar cliente' });
      }
    }
  }

  async getCustomerOrders(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const orders = await customerService.getCustomerOrders(req.params.id, status);
      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ error: 'Error al obtener órdenes del cliente' });
    }
  }
}

export const customerController = new CustomerController();
