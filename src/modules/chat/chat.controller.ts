import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Request() req,
    @Body() dto: CreateConversationDto
  ) {
    return this.chatService.createOrGetConversation(req.user.userId, dto);
  }

  @Get('conversations')
  async getConversations(
    @Request() req,
    @Query() pagination: PaginationDto
  ) {
    return this.chatService.getConversations(req.user.userId, pagination);
  }

  @Get('conversations/:id')
  async getConversation(
    @Request() req,
    @Param('id') conversationId: string
  ) {
    return this.chatService.getConversation(conversationId, req.user.userId);
  }

  @Post('messages')
  async sendMessage(
    @Request() req,
    @Body() dto: SendMessageDto
  ) {
    return this.chatService.sendMessage(req.user.userId, dto);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Request() req,
    @Param('id') conversationId: string,
    @Query() pagination: PaginationDto
  ) {
    return this.chatService.getMessages(
      conversationId, 
      req.user.userId, 
      pagination
    );
  }

  @Post('messages/mark-read')
  async markMessagesAsRead(
    @Request() req,
    @Body() dto: MarkReadDto
  ) {
    await this.chatService.markAsRead(req.user.userId, dto);
    return { success: true };
  }

  @Delete('messages/:id')
  async deleteMessage(
    @Request() req,
    @Param('id') messageId: string
  ) {
    await this.chatService.deleteMessage(messageId, req.user.userId);
    return { success: true };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.chatService.getUnreadCount(req.user.userId);
    return { unreadCount: count };
  }
}