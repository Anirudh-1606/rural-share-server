import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class OtpLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,15}$/, { message: 'Valid phone number is required' })
  phone: string;
} 