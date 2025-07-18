import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageType {
  SYSTEM = 'system',
  NOTIFICATION = 'notification',
  ALERT = 'alert',
  BROADCAST = 'broadcast'
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, enum: MessageType, default: MessageType.NOTIFICATION })
  type: MessageType;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recipientId?: Types.ObjectId; // Optional for broadcasts

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: String })
  actionUrl?: string; // For clickable notifications

  @Prop({ type: Map, of: String })
  metadata?: Map<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ recipientId: 1, isRead: 1 });
MessageSchema.index({ createdAt: -1 });