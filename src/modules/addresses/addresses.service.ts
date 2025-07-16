import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from './addresses.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    // If this is set as default, unset other default addresses
    if (dto.isDefault) {
      await this.addressModel.updateMany(
        { userId: dto.userId },
        { isDefault: false }
      );
    }
    
    const address = new this.addressModel(dto);
    return address.save();
  }

  async findAllByUser(userId: string): Promise<Address[]> {
    return this.addressModel.find({ userId }).exec();
  }

  async findById(id: string): Promise<Address> {
    const address = await this.addressModel.findById(id).exec();
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async update(id: string, dto: UpdateAddressDto): Promise<Address> {
    // If updating to default, unset other defaults
    if (dto.isDefault) {
      const address = await this.findById(id);
      await this.addressModel.updateMany(
        { userId: address.userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }
    
    const updated = await this.addressModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Address not found');
    return updated;
  }

  async delete(id: string): Promise<Address> {
    const removed = await this.addressModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Address not found');
    return removed;
  }

  async setDefault(id: string): Promise<Address> {
    const address = await this.addressModel.findById(id).exec();
    if (!address) throw new NotFoundException('Address not found');
    
    await this.addressModel.updateMany(
      { userId: address.userId },
      { isDefault: false }
    );
    
    address.isDefault = true;
    return address.save();
  }
}