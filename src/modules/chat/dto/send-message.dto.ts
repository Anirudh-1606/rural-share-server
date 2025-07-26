import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId, IsObject } from 'class-validator';
import { MessageType } from '../schemas/message.schema';

export class SendMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsMongoId()
  recipientId: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}