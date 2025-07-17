import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Escrow, EscrowDocument, EscrowStatus } from './escrow.schema';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class EscrowService {
  constructor(
    @InjectModel(Escrow.name) private escrowModel: Model<EscrowDocument>,
    private readonly ordersService: OrdersService,
  ) {}

  async create(dto: CreateEscrowDto): Promise<Escrow> {
    // Check if escrow already exists for order
    const existing = await this.escrowModel.findOne({ orderId: dto.orderId });
    if (existing) {
      throw new BadRequestException('Escrow already exists for this order');
    }

    // Get order details
    const order = await this.ordersService.findById(dto.orderId);

    const escrow = new this.escrowModel({
      orderId: dto.orderId,
      seekerId: order.seekerId,
      providerId: order.providerId,
      amount: dto.amount,
      status: EscrowStatus.HELD,
      heldAt: new Date()
    });
    
    return escrow.save();
  }

  async findByOrder(orderId: string): Promise<Escrow> {
    const escrow = await this.escrowModel.findOne({ orderId }).exec();
    if (!escrow) throw new NotFoundException('Escrow record not found');
    return escrow;
  }

  async findAll(): Promise<Escrow[]> {
    return this.escrowModel.find().exec();
  }

  async release(orderId: string, releasedBy: string): Promise<Escrow> {
    const escrow = await this.findByOrder(orderId);
    
    if (escrow.status !== EscrowStatus.HELD && escrow.status !== EscrowStatus.DISPUTED) {
      throw new BadRequestException(`Cannot release escrow in ${escrow.status} status`);
    }

    const updated = await this.escrowModel.findOneAndUpdate(
      { orderId },
      {
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
        releasedBy,
        updatedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!updated) throw new NotFoundException('Escrow record not found');
    return updated;
  }

  async refund(orderId: string, reason: string, refundedBy?: string): Promise<Escrow> {
    const escrow = await this.findByOrder(orderId);
    
    if (escrow.status !== EscrowStatus.HELD && escrow.status !== EscrowStatus.DISPUTED) {
      throw new BadRequestException(`Cannot refund escrow in ${escrow.status} status`);
    }

    const updated = await this.escrowModel.findOneAndUpdate(
      { orderId },
      {
        status: EscrowStatus.REFUNDED,
        refundedAt: new Date(),
        refundedBy,
        metadata: new Map([['refundReason', reason]]),
        updatedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!updated) throw new NotFoundException('Escrow record not found');
    return updated;
  }

  async partialRefund(orderId: string, refundAmount: number, reason: string, refundedBy?: string): Promise<Escrow> {
    const escrow = await this.findByOrder(orderId);
    
    if (escrow.status !== EscrowStatus.HELD && escrow.status !== EscrowStatus.DISPUTED) {
      throw new BadRequestException(`Cannot process partial refund in ${escrow.status} status`);
    }

    if (refundAmount > escrow.amount) {
      throw new BadRequestException('Refund amount cannot exceed escrow amount');
    }

    const updated = await this.escrowModel.findOneAndUpdate(
      { orderId },
      {
        status: EscrowStatus.PARTIAL_REFUND,
        refundedAt: new Date(),
        refundedBy,
        refundAmount,
        metadata: new Map([['refundReason', reason]]),
        updatedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!updated) throw new NotFoundException('Escrow record not found');
    return updated;
  }

  async dispute(orderId: string, reason: string): Promise<Escrow> {
    const escrow = await this.findByOrder(orderId);
    
    if (escrow.status !== EscrowStatus.HELD) {
      throw new BadRequestException(`Cannot dispute escrow in ${escrow.status} status`);
    }

    const updated = await this.escrowModel.findOneAndUpdate(
      { orderId },
      {
        status: EscrowStatus.DISPUTED,
        disputeReason: reason,
        updatedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!updated) throw new NotFoundException('Escrow record not found');
    return updated;
  }

  async update(id: string, status: string): Promise<Escrow> {
    const rec = await this.escrowModel.findById(id).exec();
    if (!rec) throw new NotFoundException('Escrow record not found');
    rec.status = status;
    rec.updatedAt = new Date();
    return rec.save();
  }

  async getEscrowSummary(userId: string): Promise<any> {
    const [seekerEscrows, providerEscrows] = await Promise.all([
      this.escrowModel.find({ seekerId: userId }).exec(),
      this.escrowModel.find({ providerId: userId }).exec()
    ]);

    const calculateSummary = (escrows: Escrow[]) => {
      return escrows.reduce((acc, escrow) => {
        acc.total += escrow.amount;
        acc[escrow.status] = (acc[escrow.status] || 0) + escrow.amount;
        return acc;
      }, { 
        total: 0, 
        held: 0, 
        released: 0, 
        refunded: 0, 
        disputed: 0,
        partial_refund: 0 
      });
    };

    return {
      asSeeker: calculateSummary(seekerEscrows),
      asProvider: calculateSummary(providerEscrows)
    };
  }
}
