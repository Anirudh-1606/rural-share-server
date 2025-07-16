import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    validate: [arrayLimit, 'Participants must be exactly 2']
  })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  lastActivity: Date;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  relatedOrderId?: Types.ObjectId; // Optional: Link chat to an order

  @Prop({ type: Map, of: Date })
  lastReadBy: Map<string, Date>; // userId -> last read timestamp

  @Prop({ type: Map, of: Number, default: new Map() })
  unreadCount: Map<string, number>; // userId -> unread count
}

function arrayLimit(val: any[]) {
  return val.length === 2;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastActivity: -1 });