import { IsString, IsNotEmpty, IsMongoId, IsArray, ArrayNotEmpty, ArrayMinSize, IsNumber, IsDateString } from 'class-validator';

export class CreateListingDto {
  @IsMongoId()
  providerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  subCategory: string;

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
}