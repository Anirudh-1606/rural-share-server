import { IsEnum } from 'class-validator';

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateKycStatusDto {
  @IsEnum(KycStatus)
  status: KycStatus;
}
