import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId, IsBoolean, IsNumber } from 'class-validator';

export enum CatalogueType {
  HUMAN = 'human',
  MECHANICAL = 'mechanical'
}

export class CreateCatalogueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CatalogueType)
  type: CatalogueType;

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
}
