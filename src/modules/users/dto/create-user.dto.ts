import { IsString, IsEmail, MinLength, IsIn, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsString()
  @IsIn(['individual', 'SHG', 'FPO', 'admin'])
  role: string;
}
