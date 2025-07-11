import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { KycService } from './kyc.service';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UpdateKycStatusDto } from './dto/update-kyc-status.dto';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('documents')
  async uploadDocument(@Body() dto: CreateKycDocumentDto) {
    return this.kycService.create(dto);
  }

  @Get('documents/user/:userId')
  async getUserDocuments(@Param('userId') userId: string) {
    return this.kycService.findByUser(userId);
  }

  @Patch('documents/:id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateKycStatusDto,
  ) {
    return this.kycService.updateStatus(id, dto);
  }
}
