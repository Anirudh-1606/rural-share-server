import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { OtpLoginDto } from './dto/otp-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createDto: { name: string; email: string; password: string; phone: string; role: string }) {
    return this.authService.register(createDto);
  }

  @Post('login')
  async login(@Body() creds: { email: string; password: string }) {
    return this.authService.login(await this.authService.validateUser(creds.email, creds.password));
  }

  @Post('otp-login')
  async otpLogin(@Body() otpLoginDto: OtpLoginDto) {
    return this.authService.otpLogin(otpLoginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}