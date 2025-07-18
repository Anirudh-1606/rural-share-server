import { IsMongoId, IsNumber, IsPositive } from 'class-validator';

export class CreateEscrowDto {
  @IsMongoId()
  orderId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
