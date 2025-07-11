import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './listings.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
  ) {}

  async create(dto: CreateListingDto): Promise<Listing> {
    const listing = new this.listingModel(dto);
    return listing.save();
  }

  async findAll(): Promise<Listing[]> {
    return this.listingModel.find().exec();
  }

  async findByProvider(providerId: string): Promise<Listing[]> {
    return this.listingModel.find({ providerId }).exec();
  }

  async findById(id: string): Promise<Listing> {
    const listing = await this.listingModel.findById(id).exec();
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(id: string, dto: UpdateListingDto): Promise<Listing> {
    const updated = await this.listingModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Listing not found');
    return updated;
  }

  async delete(id: string): Promise<Listing> {
    const removed = await this.listingModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Listing not found');
    return removed;
  }
}