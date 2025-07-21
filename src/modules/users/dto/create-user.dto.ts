import { IsString, IsEmail, MinLength, IsIn, Matches, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsPhoneNumber('IN')
  @Matches(/^\d{10,15}$/, { message: 'Valid phone number is required' })
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  
  

  @IsString()
  @IsIn(['individual', 'SHG', 'FPO', 'admin'])
  role: string;
}
