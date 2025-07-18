import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EscrowDocument = Escrow & Document;

export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  PARTIAL_REFUND = 'partial_refund'
}

@Schema({ timestamps: true })
export class Escrow {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seekerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  providerId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true, enum: Object.values(EscrowStatus) })
  status: string;

  @Prop({ type: Date })
  heldAt: Date;

  @Prop({ type: Date })
  releasedAt?: Date;

  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  disputeReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  releasedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  refundedBy?: Types.ObjectId;

  @Prop({ type: Number })
  refundAmount?: number; // For partial refunds

  @Prop({ type: Map, of: String })
  metadata?: Map<string, any>;

  @Prop()
  updatedAt: Date;
}

export const EscrowSchema = SchemaFactory.createForClass(Escrow);
EscrowSchema.index({ orderId: 1 }, { unique: true });
EscrowSchema.index({ seekerId: 1, status: 1 });
EscrowSchema.index({ providerId: 1, status: 1 });
