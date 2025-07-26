import { IsBoolean, IsOptional, IsString, IsIn, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePreferencesDto } from './update-preferences.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['none', 'pending', 'approved', 'rejected'])
  kycStatus?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePreferencesDto)
  preferences?: UpdatePreferencesDto;

  @IsOptional()
  @IsMongoId()
  defaultAddressId?: string;
} 