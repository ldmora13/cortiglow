import { userRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import { auditService } from './audit.service';

interface CreateUserPayload {
  email: string;
  password?: string;
  full_name?: string;
  role?: string;
}

interface UpdateUserPayload {
  full_name?: string;
  role?: string;
}

export class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async createUser(data: CreateUserPayload, userId: string = 'SYSTEM') {
    if (!data.email || !data.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    if (data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const role = data.role || 'editor';
    if (!['admin', 'editor'].includes(role)) {
      throw new Error('Rol inválido. Debe ser "admin" o "editor"');
    }

    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    const newUser = await userRepository.create({
      email: data.email,
      password_hash,
      full_name: data.full_name || 'Usuario',
      role
    });
    await auditService.logAction('USER', newUser.id, 'CREATE', userId, null, { email: newUser.email, role: newUser.role, full_name: newUser.full_name });
    return newUser;
  }

  async updateUser(id: string, data: UpdateUserPayload, userId: string = 'SYSTEM') {
    if (data.role && !['admin', 'editor'].includes(data.role)) {
      throw new Error('Rol inválido. Debe ser "admin" o "editor"');
    }

    const existing = await userRepository.findById(id);
    const updated = await userRepository.update(id, {
      ...(data.full_name && { full_name: data.full_name }),
      ...(data.role && { role: data.role }),
    });
    if (existing) {
      await auditService.logAction('USER', id, 'UPDATE', userId, 
        { full_name: existing.full_name, role: existing.role }, 
        { full_name: updated.full_name, role: updated.role }
      );
    }
    return updated;
  }

  async updatePassword(id: string, password?: string, userId: string = 'SYSTEM') {
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const existing = await userRepository.findById(id);
    await userRepository.update(id, { password_hash });
    if (existing) await auditService.logAction('USER', id, 'UPDATE_PASSWORD', userId, null, null);
    return { message: 'Contraseña actualizada correctamente' };
  }

  async deleteUser(id: string, currentUserId: string) {
    if (currentUserId === id) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    const existing = await userRepository.findById(id);
    await userRepository.delete(id);
    if (existing) await auditService.logAction('USER', id, 'DELETE', currentUserId, { email: existing.email }, { is_active: false });
    return { message: 'Usuario eliminado correctamente' };
  }
}

export const userService = new UserService();
