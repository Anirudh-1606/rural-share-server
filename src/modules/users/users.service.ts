import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createDto: CreateUserDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: createDto.email });
    if (exists) throw new BadRequestException('Email already in use');
    
    const user = new this.userModel({
      ...createDto,
      preferences: {
        defaultLandingPage: 'provider',
        defaultProviderTab: 'active',
        notificationsEnabled: true
      }
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<User> {
    const user = await this.findById(userId);
    
    // Update preferences
    if (dto.defaultLandingPage !== undefined) {
      user.preferences.defaultLandingPage = dto.defaultLandingPage;
    }
    if (dto.defaultProviderTab !== undefined) {
      user.preferences.defaultProviderTab = dto.defaultProviderTab;
    }
    if (dto.preferredLanguage !== undefined) {
      user.preferences.preferredLanguage = dto.preferredLanguage;
    }
    if (dto.notificationsEnabled !== undefined) {
      user.preferences.notificationsEnabled = dto.notificationsEnabled;
    }
    
    return user.save();
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<User> {
    const user = await this.findById(userId);
    user.defaultAddressId = addressId as any;
    return user.save();
  }

  async getUserWithAddress(userId: string): Promise<any> {
    return this.userModel
      .findById(userId)
      .populate('defaultAddressId')
      .exec();
  }
}