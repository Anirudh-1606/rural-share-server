import { IsEnum, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { DisputeResolution } from '../disputes.schema';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution;

  @IsString()
  @IsOptional()
  adminNotes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  refundAmount?: number; // For partial refunds
}