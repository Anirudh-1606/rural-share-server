import { 
  IsString, 
  IsNotEmpty, 
  IsMongoId, 
  IsArray, 
  ArrayNotEmpty, 
  ArrayMinSize, 
  IsNumber, 
  IsDateString, 
  IsBoolean, 
  IsOptional,
  IsEnum,
  IsUrl,
  Min
} from 'class-validator';

export enum UnitOfMeasure {
  PER_HOUR = 'per_hour',
  PER_DAY = 'per_day',
  PER_PIECE = 'per_piece',
  PER_KG = 'per_kg',
  PER_UNIT = 'per_unit'
}

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

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[]; // [longitude, latitude]

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minimumOrder?: number;

  @IsDateString()
  availableFrom: string;

  @IsDateString()
  availableTo: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  termsAndConditions?: string;
}
