import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KycDocument, KycDocumentSchema } from './kyc.schema';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KycDocument.name, schema: KycDocumentSchema },
    ]),
  ],
  providers: [KycService],
  controllers: [KycController],
  exports: [KycService],
})
export class KycModule {}
