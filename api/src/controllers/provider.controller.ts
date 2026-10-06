import { Request, Response } from 'express';
import { providerService } from '../services/provider.service';
import { extractUserId } from '../utils/auth';

export class ProviderController {
  
  async getAll(req: Request, res: Response) {
    try {
      const providers = await providerService.getAllProviders();
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ error: 'Error fetching providers' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const provider = await providerService.getProviderById(req.params.id);
      res.json(provider);
    } catch (error: any) {
      if (error.message === 'Provider not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error fetching provider' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const provider = await providerService.createProvider(req.body, userId);
      res.json(provider);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: 'Error creating provider' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const provider = await providerService.updateProvider(req.params.id, req.body, userId);
      res.json(provider);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: 'Error updating provider' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      await providerService.deleteProvider(req.params.id, userId);
      res.json({ message: 'Provider deleted successfully' });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: 'Error deleting provider' });
    }
  }
}

export const providerController = new ProviderController();
