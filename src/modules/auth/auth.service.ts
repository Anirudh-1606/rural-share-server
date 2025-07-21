import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { OtpLoginDto } from './dto/otp-login.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;

    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    let user;
    if (email) {
      user = await this.usersService.findByEmail(email);
    } else if (phone) {
      user = await this.usersService.findByPhone(phone);
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const { password: userPassword, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createDto: CreateUserDto) {
    const user = await this.usersService.create(createDto);
    const { password, ...result } = user.toObject();
    return result;
  }

  async otpLogin(otpLoginDto: OtpLoginDto) {
    const { email, phone } = otpLoginDto;

    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    let user;
    if (email) {
      user = await this.usersService.findByEmail(email);
      if (!user) {
        console.log(`Email ${email} not found in database`);
        throw new NotFoundException('Email not registered');
      }
      console.log(`Email ${email} found for user: ${user.email}`);
    } else if (phone) {
      user = await this.usersService.findByPhone(phone);
      if (!user) {
        console.log(`Phone number ${phone} not found in database`);
        throw new NotFoundException('Phone number not registered');
      }
      console.log(`Phone number ${phone} found for user: ${user.email}`);
    }

    // 3. Mark user as verified (if not already)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
      console.log(`User ${user.email} marked as verified`);
    }

    // 4. Generate JWT token (matching the specification exactly)
    const payload = {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 5. Return success response (matching the specification exactly)
    return {
      message: 'OTP login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      },
    };
  }
}