import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability, AvailabilityDocument } from './availability.schema';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(
    @InjectModel(Availability.name) private availModel: Model<AvailabilityDocument>,
  ) {}

  async create(dto: CreateAvailabilityDto): Promise<Availability> {
    const avail = new this.availModel(dto);
    return avail.save();
  }

  async findByListing(listingId: string): Promise<Availability[]> {
    return this.availModel.find({ listingId }).exec();
  }

  async update(id: string, dto: UpdateAvailabilityDto): Promise<Availability> {
    const updated = await this.availModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Availability not found');
    return updated;
  }

  async delete(id: string): Promise<Availability> {
    const removed = await this.availModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Availability not found');
    return removed;
  }
}