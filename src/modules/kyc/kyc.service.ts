import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KycDocument, KycDocumentDocument } from './kyc.schema';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UpdateKycStatusDto } from './dto/update-kyc-status.dto';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(KycDocument.name)
    private kycModel: Model<KycDocumentDocument>,
  ) {}

  async create(dto: CreateKycDocumentDto): Promise<KycDocument> {
    const doc = new this.kycModel(dto);
    return doc.save();
  }

  async findByUser(userId: string): Promise<KycDocument[]> {
    return this.kycModel.find({ userId }).exec();
  }

  async updateStatus(id: string, dto: UpdateKycStatusDto): Promise<KycDocument> {
    const doc = await this.kycModel.findById(id).exec();
    if (!doc) throw new NotFoundException('KYC document not found');
    doc.status = dto.status;
    if (dto.status === 'approved') {
      doc.verifiedAt = new Date();
    }
    return doc.save();
  }
}
