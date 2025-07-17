import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CatalogueDocument = Catalogue & Document;

export enum ResourceCategory {
  MACHINES_EQUIPMENT = 'machines_equipment',
  MANPOWER = 'manpower',
  MATERIALS_TOOLS = 'materials_tools',
  PRODUCTS_PRODUCE = 'products_produce'
}

export enum TransactionType {
  RENTAL = 'rental',
  HIRING = 'hiring',
  SALE = 'sale'
}

export enum UnitOfMeasure {
  PER_HOUR = 'per_hour',
  PER_DAY = 'per_day',
  PER_PIECE = 'per_piece',
  PER_KG = 'per_kg',
  PER_UNIT = 'per_unit'
}

@Schema({ timestamps: true })
export class Catalogue {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true, enum: Object.values(ResourceCategory) })
  category: ResourceCategory;

  @Prop({ type: String, required: true, enum: Object.values(TransactionType) })
  transactionType: TransactionType;

  @Prop({ type: Types.ObjectId, ref: 'Catalogue', default: null })
  parentId: Types.ObjectId | null; // For subcategories

  @Prop({ type: String })
  icon: string; // Icon URL or class name

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  @Prop({ type: String, enum: Object.values(UnitOfMeasure) })
  defaultUnitOfMeasure?: UnitOfMeasure;

  @Prop({ type: Number })
  suggestedMinPrice?: number;

  @Prop({ type: Number })
  suggestedMaxPrice?: number;
    private _id: any;
    id: any;
}

export const CatalogueSchema = SchemaFactory.createForClass(Catalogue);
CatalogueSchema.index({ parentId: 1 });
CatalogueSchema.index({ category: 1, isActive: 1 });
CatalogueSchema.index({ category: 1, transactionType: 1 });