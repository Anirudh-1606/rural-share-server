import { Controller, Post, Body, Request, UseGuards, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { OtpLoginDto } from './dto/otp-login.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createDto: { name: string; email: string; password: string; phone: string; role: string }) {
    return this.authService.register(createDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Post('otp-login')
  async otpLogin(@Body() otpLoginDto: OtpLoginDto) {
    return this.authService.otpLogin(otpLoginDto);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('verify-token')
  async verifyToken(@Request() req) {
    return { 
      valid: true, 
      userId: req.user.userId,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role
    };
  }

  @Post('validate-token')
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    return this.authService.validateToken(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req) {
    // Revoke all refresh tokens for this user
    await this.authService.revokeUserTokens(req.user.userId);
    return { message: 'Logged out successfully' };
  }
}