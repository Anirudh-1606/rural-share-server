import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KycDocumentDocument = KycDocument & Document;

@Schema({ timestamps: true })
export class KycDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({default:"Aadhar", type: String, required: true })
  docType: string; // e.g. 'passport', 'driver_license'

  @Prop({ type: String, required: true })
  docURL: string;  // URL or path to the uploaded file

  @Prop({ default: 'pending', enum: ['pending','approved','rejected'] })
  status: string;

  @Prop()
  verifiedAt: Date;
}

export const KycDocumentSchema = SchemaFactory.createForClass(KycDocument);
