import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';
import { CreateOrderDto, OrderStatus } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = new this.orderModel({ ...dto, createdAt: new Date() });
    return order.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findBySeeker(seekerId: string): Promise<Order[]> {
    return this.orderModel.find({ seekerId }).exec();
  }

  async findByProvider(providerId: string): Promise<Order[]> {
    return this.orderModel.find({ providerId }).exec();
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const updated = await this.orderModel.findByIdAndUpdate(id, { status: dto.status }, { new: true }).exec();
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }

   async getProviderSummary(providerId: string): Promise<{ totalOrders: number; fulfilledOrders: number; revenue: number }> {
    const totalOrders = await this.orderModel.countDocuments({ providerId }).exec();
    const fulfilledOrders = await this.orderModel.countDocuments({ providerId, status: OrderStatus.COMPLETED }).exec();
    const agg = await this.orderModel.aggregate([
      { $match: { providerId: new Types.ObjectId(providerId), status: OrderStatus.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]).exec();
    const revenue = agg[0]?.total || 0;
    return { totalOrders, fulfilledOrders, revenue };
  }
}