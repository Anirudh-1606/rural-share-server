import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  raterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ratedId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  score: number;

  @Prop({ type: String, default: '' })
  review: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);