import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KycDocumentDocument = KycDocument & Document;

@Schema({ timestamps: true })
export class KycDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['aadhar', 'pan', 'passport', 'voter_id', 'driving_license'] })
  docType: string;

  @Prop({ type: String, required: true })
  docURL: string;

  @Prop({ type: String })
  docNumber?: string; // Document number for verification

  @Prop({ type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId; // Admin who verified
}

export const KycDocumentSchema = SchemaFactory.createForClass(KycDocument);
KycDocumentSchema.index({ userId: 1, docType: 1 }, { unique: true }); // One doc type per user