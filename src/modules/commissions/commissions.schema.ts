import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommissionDocument = Commission & Document;

@Schema({ timestamps: true })
export class Commission {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);