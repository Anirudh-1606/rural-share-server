import { IsMongoId, IsEnum, IsDateString, IsNumber, ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import { OrderType } from '../orders.schema';

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

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsNumber()
  totalAmount: number;

  @IsDateString()
  @IsOptional()
  serviceStartDate?: string;

  @IsDateString()
  @IsOptional()
  serviceEndDate?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  coordinates?: number[];
}
