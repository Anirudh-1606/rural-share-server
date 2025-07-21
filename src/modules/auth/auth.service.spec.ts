import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import { LoginDto } from './dto/login.dto';

const mockUser = {
  _id: 'someUserId',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'hashedPassword',
  isVerified: false,
  toObject: () => mockUser,
  save: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByPhone: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mockToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    beforeAll(() => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should validate user with email and password', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const result = await service.validateUser(loginDto);
      expect(result).toEqual(expect.objectContaining({ email: mockUser.email }));
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should validate user with phone and password', async () => {
      jest.spyOn(usersService, 'findByPhone').mockResolvedValue(mockUser as any);
      const loginDto: LoginDto = { phone: '1234567890', password: 'password' };
      const result = await service.validateUser(loginDto);
      expect(result).toEqual(expect.objectContaining({ phone: mockUser.phone }));
      expect(usersService.findByPhone).toHaveBeenCalledWith(loginDto.phone);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false);
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };
      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found by email', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const loginDto: LoginDto = { email: 'nonexistent@example.com', password: 'password' };
      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found by phone', async () => {
      jest.spyOn(usersService, 'findByPhone').mockResolvedValue(null);
      const loginDto: LoginDto = { phone: '0987654321', password: 'password' };
      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if neither email nor phone is provided', async () => {
      const loginDto: LoginDto = { password: 'password' };
      await expect(service.validateUser(loginDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const result = await service.login(mockUser);
      expect(result).toEqual({ access_token: 'mockToken' });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser._id });
    });
  });

  describe('otpLogin', () => {
    it('should successfully log in with phone number and mark user as verified', async () => {
      jest.spyOn(usersService, 'findByPhone').mockResolvedValue(mockUser as any);
      const otpLoginDto = { phone: '1234567890' };
      const result = await service.otpLogin(otpLoginDto);

      expect(usersService.findByPhone).toHaveBeenCalledWith(otpLoginDto.phone);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('OTP login successful');
      expect(result.token).toBe('mockToken');
      expect(result.user.phone).toBe(mockUser.phone);
    });

    it('should successfully log in with email and mark user as verified', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      const otpLoginDto = { email: 'test@example.com' };
      const result = await service.otpLogin(otpLoginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(otpLoginDto.email);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('OTP login successful');
      expect(result.token).toBe('mockToken');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException if phone number not registered for OTP login', async () => {
      jest.spyOn(usersService, 'findByPhone').mockResolvedValue(null);
      const otpLoginDto = { phone: '0987654321' };
      await expect(service.otpLogin(otpLoginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if email not registered for OTP login', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const otpLoginDto = { email: 'nonexistent@example.com' };
      await expect(service.otpLogin(otpLoginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if neither email nor phone is provided for OTP login', async () => {
      const otpLoginDto = {};
      await expect(service.otpLogin(otpLoginDto as any)).rejects.toThrow(BadRequestException);
    });
  });
});