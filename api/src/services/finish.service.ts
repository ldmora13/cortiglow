import { finishRepository } from '../repositories/finish.repository';
import { auditService } from './audit.service';

export class FinishService {
  async getAllFinishes(activeOnly: boolean = false) {
    return await finishRepository.findAll(activeOnly);
  }

  async getFinishById(id: string) {
    const finish = await finishRepository.findById(id);
    if (!finish) {
      throw new Error('Finish not found');
    }
    return finish;
  }

  async createFinish(data: any, userId: string = 'SYSTEM') {
    const { name, description, price_type, price, is_active } = data;

    if (!name || !price_type || price == null) {
      throw new Error('Missing required fields: name, price_type, price');
    }

    if (!['FIXED', 'PER_METER', 'PERCENTAGE'].includes(price_type)) {
      throw new Error('Invalid price_type. Must be FIXED, PER_METER, or PERCENTAGE');
    }

    const finish = await finishRepository.create({
      name,
      description,
      price_type,
      price,
      is_active: is_active !== undefined ? is_active : true
    });
    await auditService.logAction('FINISH', finish.id, 'CREATE', userId, null, finish);
    return finish;
  }

  async updateFinish(id: string, data: any, userId: string = 'SYSTEM') {
    const existingFinish = await finishRepository.findById(id);
    if (!existingFinish) {
      throw new Error('Finish not found');
    }

    if (data.price_type && !['FIXED', 'PER_METER', 'PERCENTAGE'].includes(data.price_type)) {
      throw new Error('Invalid price_type. Must be FIXED, PER_METER, or PERCENTAGE');
    }

    return await finishRepository.update(id, data);
  }

  async softDeleteFinish(id: string, userId: string = 'SYSTEM') {
    const existingFinish = await finishRepository.findById(id);
    if (!existingFinish) {
      throw new Error('Finish not found');
    }

    return await finishRepository.update(id, { is_active: false });
  }
}

export const finishService = new FinishService();
