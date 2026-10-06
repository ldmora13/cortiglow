import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import apicache from 'apicache';
import { extractUserId } from '../utils/auth';

export class OrderController {
  async getAll(req: Request, res: Response) {
    try {
      const { status, customer_id, payment_method, date_from, date_to, limit = '50' } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (customer_id) filters.customer_id = customer_id;
      if (payment_method) filters.payment_method = payment_method;

      if (date_from || date_to) {
        filters.created_at = {};
        if (date_from) filters.created_at.gte = new Date(date_from as string);
        if (date_to) filters.created_at.lte = new Date(date_to as string);
      }

      const orders = await orderService.getAllOrders(filters, parseInt(limit as string));
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Error al obtener órdenes' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json(order);
    } catch (error: any) {
      if (error.message === 'Orden no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Error al obtener orden' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await orderService.createOrder(req.body, userId);
      apicache.clear('/api/orders');
      apicache.clear('/api/inventory');
      res.status(201).json(result);
    } catch (error: any) {
      console.error('❌ Error creando orden:', error.message || error);
      if (error.invalid_items) {
        res.status(400).json({ error: error.message, invalid_items: error.invalid_items });
      } else {
        res.status(error.message === 'Cliente no encontrado' ? 404 : 400).json({ error: error.message || 'Error al crear orden' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const order = await orderService.updateOrder(req.params.id, req.body, userId);
      apicache.clear('/api/orders');
      res.json(order);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Error al actualizar orden' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || req.body.created_by || 'SYSTEM';
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status, userId);
      apicache.clear('/api/orders');
      apicache.clear('/api/inventory');
      res.json(order);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      if (error.message === 'Orden no encontrada') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Estado requerido' || error.message === 'Estado inválido') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar estado de orden' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await orderService.deleteOrder(req.params.id, userId);
      apicache.clear('/api/orders');
      apicache.clear('/api/inventory');
      res.json(result);
    } catch (error: any) {
      console.error('Error deleting order:', error);
      if (error.message === 'Orden no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al eliminar orden' });
      }
    }
  }

  async registerPayment(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const payment = await orderService.registerPayment(req.params.id, req.body, userId);
      apicache.clear('/api/orders');
      res.status(201).json(payment);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      if (error.message === 'Orden no encontrada') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Monto y método de pago requeridos') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al registrar pago' });
      }
    }
  }
}

export const orderController = new OrderController();
