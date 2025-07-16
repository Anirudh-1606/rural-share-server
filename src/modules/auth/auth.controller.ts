import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}