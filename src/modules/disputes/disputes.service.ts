import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dispute, DisputeDocument, DisputeStatus, DisputeResolution } from './disputes.schema';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { OrdersService } from '../orders/orders.service';
import { EscrowService } from '../escrow/escrow.service';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
    private readonly ordersService: OrdersService,
    private readonly escrowService: EscrowService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto): Promise<Dispute> {
    // Verify order exists and user is part of it
    const order = await this.ordersService.findById(dto.orderId);
    
    if (order.seekerId.toString() !== userId && order.providerId.toString() !== userId) {
      throw new ForbiddenException('You are not part of this order');
    }

    // Check if dispute already exists
    const existing = await this.disputeModel.findOne({ orderId: dto.orderId });
    if (existing) {
      throw new BadRequestException('Dispute already exists for this order');
    }

    // Determine against user
    const againstUser = order.seekerId.toString() === userId 
      ? order.providerId 
      : order.seekerId;

    const dispute = new this.disputeModel({
      ...dto,
      raisedBy: userId,
      againstUser
    });

    // Hold escrow funds if not already held
    try {
      await this.escrowService.dispute(dto.orderId, dto.reason);
    } catch (error) {
      console.error('Error updating escrow:', error);
    }

    return dispute.save();
  }

  async findAll(filters?: { status?: DisputeStatus; userId?: string }): Promise<Dispute[]> {
    const query: any = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.userId) {
      query.$or = [
        { raisedBy: filters.userId },
        { againstUser: filters.userId }
      ];
    }

    return this.disputeModel
      .find(query)
      .populate('orderId')
      .populate('raisedBy', 'name email')
      .populate('againstUser', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Dispute> {
    const dispute = await this.disputeModel
      .findById(id)
      .populate('orderId')
      .populate('raisedBy', 'name email')
      .populate('againstUser', 'name email')
      .populate('resolvedBy', 'name email')
      .exec();

    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }

  async addMessage(disputeId: string, userId: string, dto: AddMessageDto): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(disputeId)
      .populate('raisedBy', 'name email')
      .populate('againstUser', 'name email')
      .exec();
    
    if (!dispute) throw new NotFoundException('Dispute not found');
    
    // Verify user is part of dispute or admin
    if (dispute.raisedBy._id.toString() !== userId && 
        dispute.againstUser._id.toString() !== userId) {
      // TODO: Check if user is admin
      throw new ForbiddenException('You are not part of this dispute');
    }

    dispute.messages.push({
      userId: userId as any,
      message: dto.message,
      createdAt: new Date()
    });

    return dispute.save();
  }

  async updateStatus(id: string, status: DisputeStatus): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(id).exec();
    if (!dispute) throw new NotFoundException('Dispute not found');
    
    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED) {
      throw new BadRequestException('Cannot update resolved or closed disputes');
    }

    dispute.status = status;
    
    if (status === DisputeStatus.UNDER_REVIEW) {
      dispute.escalatedAt = new Date();
    }

    return dispute.save();
  }

  async resolve(id: string, adminId: string, dto: ResolveDisputeDto): Promise<Dispute> {
    const dispute = await this.disputeModel.findById(id).exec();
    if (!dispute) throw new NotFoundException('Dispute not found');
    
    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED) {
      throw new BadRequestException('Dispute already resolved');
    }

    dispute.resolution = dto.resolution;
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolvedBy = adminId as any;
    dispute.resolvedAt = new Date();
    dispute.adminNotes = dto.adminNotes;
    
    if (dto.resolution === DisputeResolution.PARTIAL_REFUND && dto.refundAmount) {
      dispute.refundAmount = dto.refundAmount;
    }

    // Handle escrow based on resolution
    const orderId = dispute.orderId.toString();
    switch (dto.resolution) {
      case DisputeResolution.REFUND_TO_SEEKER:
        await this.escrowService.refund(orderId, 'Dispute resolved in favor of seeker', adminId);
        break;
      case DisputeResolution.RELEASE_TO_PROVIDER:
        await this.escrowService.release(orderId, adminId);
        break;
      case DisputeResolution.PARTIAL_REFUND:
        if (dto.refundAmount) {
          await this.escrowService.partialRefund(
            orderId, 
            dto.refundAmount, 
            'Dispute resolved with partial refund',
            adminId
          );
        }
        break;
    }

    return dispute.save();
  }

  async getDisputeStats(): Promise<any> {
    const [total, open, underReview, resolved] = await Promise.all([
      this.disputeModel.countDocuments(),
      this.disputeModel.countDocuments({ status: DisputeStatus.OPEN }),
      this.disputeModel.countDocuments({ status: DisputeStatus.UNDER_REVIEW }),
      this.disputeModel.countDocuments({ status: DisputeStatus.RESOLVED }),
    ]);

    const avgResolutionTime = await this.disputeModel.aggregate([
      { $match: { status: DisputeStatus.RESOLVED } },
      {
        $project: {
          resolutionTime: {
            $subtract: ['$resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    return {
      total,
      open,
      underReview,
      resolved,
      avgResolutionTimeMs: avgResolutionTime[0]?.avgTime || 0,
      avgResolutionTimeDays: avgResolutionTime[0] 
        ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60 * 24)) 
        : 0
    };
  }
}
