import { Request, Response } from 'express';
import { quoteService } from '../services/quote.service';
import { extractUserId } from '../utils/auth';

export class QuoteController {
  async getAll(req: Request, res: Response) {
    try {
      const { status, customer_id, from_date, to_date } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status;
      if (customer_id) filters.customer_id = customer_id;
      if (from_date || to_date) {
        filters.created_at = {};
        if (from_date) filters.created_at.gte = new Date(from_date as string);
        if (to_date) filters.created_at.lte = new Date(to_date as string);
      }

      const quotes = await quoteService.getAllQuotes(filters);
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Error fetching quotes' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const quote = await quoteService.getQuoteById(req.params.id);
      res.json(quote);
    } catch (error: any) {
      if (error.message === 'Quote not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error fetching quote:', error);
        res.status(500).json({ error: 'Error fetching quote' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const quote = await quoteService.createQuote(req.body, userId);
      res.status(201).json(quote);
    } catch (error: any) {
      if (error.message.includes('Missing required fields') || error.message.includes('valid_until') || error.message.includes('not found')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: 'Error creating quote' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const quote = await quoteService.updateQuote(req.params.id, req.body, userId);
      res.json(quote);
    } catch (error: any) {
      if (error.message === 'Quote not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('not found') || error.message.includes('Only draft')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating quote:', error);
        res.status(500).json({ error: 'Error updating quote' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await quoteService.deleteQuote(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Quote not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Cannot delete')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error deleting quote:', error);
        res.status(500).json({ error: 'Error deleting quote' });
      }
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const quote = await quoteService.updateQuoteStatus(req.params.id, req.body.status, userId);
      res.json(quote);
    } catch (error: any) {
      if (error.message.includes('Invalid status') || error.message.includes('Status is required')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating quote status:', error);
        res.status(500).json({ error: 'Error updating quote status' });
      }
    }
  }

  async convertToOrder(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await quoteService.convertToOrder(req.params.id, req.body, userId);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'Quote not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Insufficient stock')) {
        res.status(400).json({ error: error.message, invalid_items: error.invalid_items });
      } else if (error.message.includes('Only accepted') || error.message.includes('already converted')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error converting quote to order:', error);
        res.status(500).json({ error: 'Error converting quote to order' });
      }
    }
  }
}

export const quoteController = new QuoteController();
