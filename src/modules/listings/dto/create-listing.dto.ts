import { IsString, IsNotEmpty, IsMongoId, IsArray, ArrayNotEmpty, ArrayMinSize, IsNumber, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateListingDto {
  @IsMongoId()
  providerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  categoryId: string;

  @IsMongoId()
  subCategoryId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  photos: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[];

  @IsNumber()
  price: number;

  @IsDateString()
  availableFrom: string;

  @IsDateString()
  availableTo: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}