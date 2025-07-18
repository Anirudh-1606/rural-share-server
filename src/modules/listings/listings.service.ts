import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './listings.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

export interface SearchFilters {
  categoryId?: string;
  subCategoryId?: string;
  priceMin?: number;
  priceMax?: number;
  distance?: number; // in kilometers
  coordinates?: number[];
  searchText?: string;
  isActive?: boolean;
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
  ) {}

  async create(dto: CreateListingDto): Promise<Listing> {
    const listing = new this.listingModel({
      ...dto,
      location: {
        type: 'Point',
        coordinates: dto.coordinates
      }
    });
    return listing.save();
  }

  async findAll(filters?: SearchFilters): Promise<Listing[]> {
    const query: any = { isActive: filters?.isActive ?? true };

    if (filters?.categoryId) {
      query.categoryId = filters.categoryId;
    }

    if (filters?.subCategoryId) {
      query.subCategoryId = filters.subCategoryId;
    }

    if (filters?.priceMin || filters?.priceMax) {
      query.price = {};
      if (filters.priceMin) query.price.$gte = filters.priceMin;
      if (filters.priceMax) query.price.$lte = filters.priceMax;
    }

    // Geo-spatial search
    if (filters?.coordinates && filters?.distance) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: filters.coordinates
          },
          $maxDistance: filters.distance * 1000 // Convert km to meters
        }
      };
    }

    let queryBuilder = this.listingModel.find(query);

    // Text search
    if (filters?.searchText) {
      queryBuilder = queryBuilder.find({ $text: { $search: filters.searchText } });
    }

    return queryBuilder
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('providerId', 'name phone')
      .exec();
  }

  async findNearby(coordinates: number[], maxDistance: number): Promise<Listing[]> {
    return this.listingModel.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      }
    })
    .populate('categoryId', 'name')
    .populate('subCategoryId', 'name')
    .populate('providerId', 'name phone')
    .exec();
  }

  async findByProvider(providerId: string): Promise<Listing[]> {
    return this.listingModel.find({ providerId }).exec();
  }

  async findById(id: string): Promise<Listing> {
    const listing = await this.listingModel
      .findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } }, // Increment view count
        { new: true }
      )
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('providerId')
      .exec();
      
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(id: string, dto: UpdateListingDto): Promise<Listing> {
    const updateData: any = { ...dto };
    
    if (dto.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: dto.coordinates
      };
      delete updateData.coordinates;
    }

    const updated = await this.listingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
      
    if (!updated) throw new NotFoundException('Listing not found');
    return updated;
  }

  async delete(id: string): Promise<Listing> {
    const removed = await this.listingModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Listing not found');
    return removed;
  }

  async incrementBookingCount(listingId: string): Promise<void> {
    await this.listingModel.findByIdAndUpdate(
      listingId,
      { $inc: { bookingCount: 1 } }
    );
  }
}