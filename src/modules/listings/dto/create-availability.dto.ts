import { IsMongoId, IsDateString, IsBoolean } from 'class-validator';

export class CreateAvailabilityDto {
  @IsMongoId()
  listingId: string;

  @IsDateString()
  date: string;

  @IsBoolean()
  isAvailable: boolean;
}