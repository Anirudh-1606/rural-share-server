import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

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
}
