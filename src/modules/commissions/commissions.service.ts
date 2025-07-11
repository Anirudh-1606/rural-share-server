import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission, CommissionDocument } from './commissions.schema';
import { CreateCommissionDto } from './dto/create-commission.dto';

@Injectable()
export class CommissionsService {
  constructor(@InjectModel(Commission.name) private comModel: Model<CommissionDocument>) {}

  async create(dto: CreateCommissionDto): Promise<Commission> {
    const rec = new this.comModel(dto);
    return rec.save();
  }

  async findByOrder(orderId: string): Promise<Commission[]> {
    return this.comModel.find({ orderId }).exec();
  }
}