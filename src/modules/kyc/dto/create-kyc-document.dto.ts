import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateKycDocumentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  docType: string;

  @IsString()
  @IsNotEmpty()
  docURL: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  docNumber?: string;
}
