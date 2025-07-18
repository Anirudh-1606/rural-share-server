import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId, IsObject } from 'class-validator';
import { MessageType } from '../messages.schema';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsMongoId()
  @IsOptional()
  recipientId?: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
