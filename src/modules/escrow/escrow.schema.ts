import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EscrowDocument = Escrow & Document;

@Schema({ timestamps: true })
export class Escrow {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true, enum: ['held','released','refunded'] })
  status: string;

  @Prop()
  updatedAt: Date;
}

export const EscrowSchema = SchemaFactory.createForClass(Escrow);