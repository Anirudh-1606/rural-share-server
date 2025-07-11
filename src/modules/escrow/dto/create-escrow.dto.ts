import { IsMongoId, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
  REFUNDED = 'refunded',
}

export class CreateEscrowDto {
  @IsMongoId()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsEnum(EscrowStatus)
  @IsOptional()
  status?: EscrowStatus;
}