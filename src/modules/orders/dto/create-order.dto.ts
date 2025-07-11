import { IsMongoId, IsEnum, IsDateString, IsNumber, ArrayMinSize, IsArray, IsOptional } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PAID = 'paid',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export class CreateOrderDto {
  @IsMongoId()
  listingId: string;

  @IsMongoId()
  seekerId: string;

  @IsMongoId()
  providerId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsDateString()
  expiresAt: string;

  @IsNumber()
  totalAmount: number;

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  coordinates?: number[];
}