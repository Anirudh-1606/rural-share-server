import { IsString, IsEmail, IsOptional, Matches } from 'class-validator';

export class OtpLoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, { message: 'Valid phone number is required' })
  phone?: string;
} 