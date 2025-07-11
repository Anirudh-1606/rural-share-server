import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AvailabilityDocument = Availability & Document;

@Schema({ timestamps: true })
export class Availability {
  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true })
  listingId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);