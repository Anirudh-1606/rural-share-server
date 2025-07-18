import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId, IsBoolean, IsNumber } from 'class-validator';
import { ResourceCategory, TransactionType, UnitOfMeasure } from '../catalogue.schema';

export class CreateCatalogueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ResourceCategory)
  category: ResourceCategory;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsMongoId()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsEnum(UnitOfMeasure)
  @IsOptional()
  defaultUnitOfMeasure?: UnitOfMeasure;

  @IsNumber()
  @IsOptional()
  suggestedMinPrice?: number;

  @IsNumber()
  @IsOptional()
  suggestedMaxPrice?: number;
}