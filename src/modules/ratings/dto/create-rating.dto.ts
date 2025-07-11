import { IsMongoId, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateRatingDto {
  @IsMongoId()
  orderId: string;

  @IsMongoId()
  raterId: string;

  @IsMongoId()
  ratedId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  review?: string;
}