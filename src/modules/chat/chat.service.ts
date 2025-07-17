import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument, MessageStatus } from './schemas/message.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createOrGetConversation(userId: string, dto: CreateConversationDto): Promise<ConversationDocument> {
    const participants = [userId, dto.participantId].sort(); // Sort to ensure consistent order
    
    // Check if conversation already exists
    let conversation = await this.conversationModel.findOne({
      participants: { $all: participants }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new this.conversationModel({
        participants,
        relatedOrderId: dto.relatedOrderId,
        lastReadBy: new Map([[userId, new Date()]]),
        unreadCount: new Map([[userId, 0], [dto.participantId, 0]])
      });
      await conversation.save();
    }

    return conversation.populate(['participants', 'lastMessage']);
  }

  async getConversations(userId: string, pagination: PaginationDto): Promise<{
    conversations: ConversationDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const query = { participants: userId };
    
    const [conversations, total] = await Promise.all([
      this.conversationModel
        .find(query)
        .populate('participants', 'name email phone')
        .populate('lastMessage')
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.conversationModel.countDocuments(query)
    ]);

    return {
      conversations,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getConversation(conversationId: string, userId: string): Promise<ConversationDocument> {
    const conversation = await this.conversationModel
      .findOne({
        _id: conversationId,
        participants: userId
      })
      .populate('participants', 'name email phone')
      .populate('lastMessage');

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async sendMessage(userId: string, dto: SendMessageDto): Promise<MessageDocument> {
    // Verify conversation exists and user is participant
    const conversation = await this.conversationModel.findOne({
      _id: dto.conversationId,
      participants: userId
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Get recipient ID
    const recipientId = conversation.participants.find(
      p => p.toString() !== userId
    );

    if (!recipientId) {
      throw new BadRequestException('Invalid conversation');
    }

    // Create message
    const message = new this.messageModel({
      conversationId: dto.conversationId,
      senderId: userId,
      recipientId,
      type: dto.type,
      content: dto.content,
      metadata: dto.metadata ? new Map(Object.entries(dto.metadata)) : undefined,
      status: MessageStatus.SENT
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id as any;
    conversation.lastActivity = new Date();
    
    // Update unread count for recipient
    const currentUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
    conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);
    
    await conversation.save();

    return message.populate(['senderId', 'recipientId']);
  }

  async getMessages(
    conversationId: string, 
    userId: string, 
    pagination: PaginationDto
  ): Promise<{
    messages: MessageDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Verify user is participant
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const query = { 
      conversationId, 
      isDeleted: false 
    };

    const [messages, total] = await Promise.all([
      this.messageModel
        .find(query)
        .populate('senderId', 'name email')
        .populate('recipientId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(query)
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(userId: string, dto: MarkReadDto): Promise<void> {
    const conversation = await this.conversationModel.findOne({
      _id: dto.conversationId,
      participants: userId
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Update messages status
    const updateQuery: any = {
      conversationId: dto.conversationId,
      recipientId: userId,
      status: { $ne: MessageStatus.READ }
    };

    if (dto.messageIds && dto.messageIds.length > 0) {
      updateQuery._id = { $in: dto.messageIds };
    }

    await this.messageModel.updateMany(updateQuery, {
      status: MessageStatus.READ,
      readAt: new Date()
    });

    // Update conversation
    conversation.lastReadBy.set(userId, new Date());
    conversation.unreadCount.set(userId, 0);
    await conversation.save();
  }

  async markAsDelivered(messageIds: string[]): Promise<void> {
    await this.messageModel.updateMany(
      { 
        _id: { $in: messageIds },
        status: MessageStatus.SENT
      },
      {
        status: MessageStatus.DELIVERED,
        deliveredAt: new Date()
      }
    );
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await this.conversationModel.find({
      participants: userId
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.unreadCount.get(userId) || 0;
    });

    return totalUnread;
  }
}