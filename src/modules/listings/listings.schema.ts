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

  @Prop({ type: Types.ObjectId, ref: 'Catalogue', required: true })
  categoryId: Types.ObjectId; // Reference to catalogue instead of string

  @Prop({ type: Types.ObjectId, ref: 'Catalogue', required: true })
  subCategoryId: Types.ObjectId; // Reference to catalogue instead of string

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

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
ListingSchema.index({ coordinates: '2dsphere' });
ListingSchema.index({ providerId: 1 });
ListingSchema.index({ categoryId: 1, subCategoryId: 1 });
