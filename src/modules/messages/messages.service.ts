import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './messages.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(dto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(dto);
    return message.save();
  }

  async broadcast(dto: CreateMessageDto): Promise<Message> {
    // Create a broadcast message without recipientId
    const message = new this.messageModel({
      ...dto,
      type: 'broadcast'
    });
    return message.save();
  }

  async findByUser(userId: string, unreadOnly = false): Promise<Message[]> {
    const query: any = { recipientId: userId };
    if (unreadOnly) query.isRead = false;
    
    return this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string, userId: string): Promise<Message> {
    const message = await this.messageModel.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    ).exec();
    
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      recipientId: userId,
      isRead: false
    });
  }
}
