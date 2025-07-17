import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CatalogueDocument = Catalogue & Document;

@Schema({ timestamps: true })
export class Catalogue {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true, enum: ['human', 'mechanical'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Catalogue', default: null })
  parentId: Types.ObjectId | null; // For subcategories

  @Prop({ type: String })
  icon: string; // Icon URL or class name

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;
}

export const CatalogueSchema = SchemaFactory.createForClass(Catalogue);
CatalogueSchema.index({ parentId: 1 });
CatalogueSchema.index({ type: 1 });