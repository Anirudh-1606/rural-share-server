import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend URL
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user ID from auth token
      const token = client.handshake.auth.token;
      const userId = await this.validateToken(token);
      
      if (!userId) {
        client.disconnect();
        return;
      }

      client.userId = userId;
      
      // Add to user sockets map
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client.id);
      this.userSockets.set(userId, sockets);

      // Join user's room
      client.join(`user:${userId}`);

      // Emit online status
      this.emitUserStatus(userId, true);

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId) return;

    // Remove from user sockets map
    const sockets = this.userSockets.get(client.userId) || [];
    const filtered = sockets.filter(id => id !== client.id);
    
    if (filtered.length > 0) {
      this.userSockets.set(client.userId, filtered);
    } else {
      this.userSockets.delete(client.userId);
      // Emit offline status only if no more sockets
      this.emitUserStatus(client.userId, false);
    }

    console.log(`User ${client.userId} disconnected socket ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    try {
      const message = await this.chatService.sendMessage(client.userId!, dto);
      
      // Emit to sender
      this.server.to(`user:${client.userId}`).emit('message_sent', message);
      
      // Emit to recipient
      const recipientId = message.recipientId.toString();
      this.server.to(`user:${recipientId}`).emit('new_message', message);

      // Mark as delivered if recipient is online
      if (this.userSockets.has(recipientId)) {
        const messageDoc = message as any; // or cast to MessageDocument
        await this.chatService.markAsDelivered([messageDoc._id.toString()]);
        this.server.to(`user:${client.userId}`).emit('message_delivered', {
          messageId: messageDoc._id,
          deliveredAt: new Date()
        });
      }

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: MarkReadDto,
  ) {
    try {
      await this.chatService.markAsRead(client.userId!, dto);
      
      // Notify sender that messages were read
      const conversation = await this.chatService.getConversation(
        dto.conversationId,
        client.userId!
      );
      
      const otherUserId = conversation.participants
        .find(p => p._id.toString() !== client.userId)
        ?._id.toString();

      if (otherUserId) {
        this.server.to(`user:${otherUserId}`).emit('messages_read', {
          conversationId: dto.conversationId,
          readBy: client.userId,
          readAt: new Date()
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    try {
      const conversation = await this.chatService.getConversation(
        data.conversationId,
        client.userId!
      );
      
      const otherUserId = conversation.participants
        .find(p => p._id.toString() !== client.userId)
        ?._id.toString();

      if (otherUserId) {
        this.server.to(`user:${otherUserId}`).emit('user_typing', {
          conversationId: data.conversationId,
          userId: client.userId,
          isTyping: data.isTyping
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('get_online_status')
  async handleGetOnlineStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() userIds: string[],
  ) {
    const statuses: Record<string, boolean> = {};
    
    userIds.forEach(userId => {
      statuses[userId] = this.userSockets.has(userId);
    });

    return { success: true, statuses };
  }

  private emitUserStatus(userId: string, isOnline: boolean) {
    this.server.emit('user_status_changed', {
      userId,
      isOnline,
      lastSeen: new Date()
    });
  }

  private async validateToken(token: string): Promise<string | null> {
    // TODO: Implement JWT validation and extract user ID
    // This is a placeholder - integrate with your auth service
    try {
      // Validate JWT and extract userId
      // return extractedUserId;
      return null;
    } catch {
      return null;
    }
  }
}