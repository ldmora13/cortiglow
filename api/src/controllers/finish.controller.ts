import { Request, Response } from 'express';
import { finishService } from '../services/finish.service';
import { extractUserId } from '../utils/auth';

export class FinishController {
  async getAll(req: Request, res: Response) {
    try {
      const activeOnly = req.query.active === 'true';
      const finishes = await finishService.getAllFinishes(activeOnly);
      res.json(finishes);
    } catch (error) {
      console.error('Error fetching finishes:', error);
      res.status(500).json({ error: 'Error fetching finishes' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const finish = await finishService.getFinishById(req.params.id);
      res.json(finish);
    } catch (error: any) {
      if (error.message === 'Finish not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error fetching finish:', error);
        res.status(500).json({ error: 'Error fetching finish' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const finish = await finishService.createFinish(req.body, userId);
      res.status(201).json(finish);
    } catch (error: any) {
      if (error.message.includes('Missing required fields') || error.message.includes('Invalid price_type')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating finish:', error);
        res.status(500).json({ error: 'Error creating finish' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const finish = await finishService.updateFinish(req.params.id, req.body, userId);
      res.json(finish);
    } catch (error: any) {
      if (error.message === 'Finish not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Invalid price_type')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating finish:', error);
        res.status(500).json({ error: 'Error updating finish' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const updatedFinish = await finishService.softDeleteFinish(req.params.id, userId);
      res.json(updatedFinish);
    } catch (error: any) {
      if (error.message === 'Finish not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error deleting finish:', error);
        res.status(500).json({ error: 'Error deleting finish' });
      }
    }
  }
}

export const finishController = new FinishController();
