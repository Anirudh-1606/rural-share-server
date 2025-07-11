import { IsMongoId, IsNumber } from 'class-validator';

export class CreateCommissionDto {
  @IsMongoId()
  orderId: string;

  @IsNumber()
  amount: number;
}