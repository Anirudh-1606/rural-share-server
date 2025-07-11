import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ListingDocument = Listing & Document;

@Schema({ timestamps: true })
export class Listing {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  providerId: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  subCategory: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
  })
  locationType: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Date })
  availableFrom: Date;

  @Prop({ type: Date })
  availableTo: Date;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
ListingSchema.index({ coordinates: '2dsphere' });