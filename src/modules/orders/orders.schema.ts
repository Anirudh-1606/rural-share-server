import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true })
  listingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seekerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  providerId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['pending','accepted','paid','completed','canceled'] })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date; // TTL index

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({ type: [Number], default: [] })
  coordinates: number[];  
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });