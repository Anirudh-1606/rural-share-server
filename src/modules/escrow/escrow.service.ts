import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Escrow, EscrowDocument } from './escrow.schema';
import { CreateEscrowDto } from './dto/create-escrow.dto';

@Injectable()
export class EscrowService {
  constructor(@InjectModel(Escrow.name) private escModel: Model<EscrowDocument>) {}

  async create(dto: CreateEscrowDto): Promise<Escrow> {
    const rec = new this.escModel(dto);
    return rec.save();
  }

  async findByOrder(orderId: string): Promise<Escrow[]> {
    return this.escModel.find({ orderId }).exec();
  }

  async update(id: string, status: string): Promise<Escrow> {
    const rec = await this.escModel.findById(id).exec();
    if (!rec) throw new NotFoundException('Escrow record not found');
    rec.status = status;
    rec.updatedAt = new Date();
    return rec.save();
  }
}