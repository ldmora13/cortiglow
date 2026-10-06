import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { extractUserId } from '../utils/auth';

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      const mappedUsers = users.map(u => ({ ...u, name: u.full_name }));
      res.json(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const userData = { ...req.body, full_name: req.body.name };
      const newUser = await userService.createUser(userData, userId);
      res.status(201).json({ ...newUser, name: newUser.full_name });
    } catch (error: any) {
      if (error.message.includes('requeridos') || error.message.includes('caracteres') || error.message.includes('inválido') || error.message.includes('registrado')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const userData = { ...req.body, full_name: req.body.name };
      const updatedUser = await userService.updateUser(req.params.id, userData, userId);
      res.json({ ...updatedUser, name: updatedUser.full_name });
    } catch (error: any) {
      if (error.message.includes('inválido')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const userId = extractUserId(req) || 'SYSTEM';
      const result = await userService.updatePassword(req.params.id, req.body.password, userId);
      res.json(result);
    } catch (error: any) {
      if (error.message.includes('caracteres')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const result = await userService.deleteUser(req.params.id, currentUser.id);
      res.json(result);
    } catch (error: any) {
      if (error.message.includes('propio usuario')) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export const userController = new UserController();
