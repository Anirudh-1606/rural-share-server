import { IsMongoId, IsString, IsNotEmpty, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateDisputeDto {
  @IsMongoId()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  evidenceUrls?: string[];
}