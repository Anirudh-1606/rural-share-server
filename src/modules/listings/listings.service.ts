// src/modules/listings/listings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './listings.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { S3Service } from '../aws/s3.service';

export interface SearchFilters {
  categoryId?: string;
  subCategoryId?: string;
  priceMin?: number;
  priceMax?: number;
  distance?: number;
  coordinates?: number[];
  searchText?: string;
  isActive?: boolean;
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: CreateListingDto, files: Array<Express.Multer.File> = []): Promise<any> {
    // Upload files and get S3 keys
    const photoKeys = files && files.length > 0 
      ? await Promise.all(
          files.map(file => this.s3Service.uploadFile(file, 'listings'))
        )
      : [];
    
    console.log('Photo keys:', photoKeys);

    // Handle both coordinate formats for backward compatibility
    let locationData;
    if (dto.location && dto.location.coordinates) {
      // New format: location object with coordinates
      locationData = {
        type: 'Point',
        coordinates: dto.location.coordinates
      };
    } else if ((dto as any).coordinates) {
      // Legacy format: coordinates directly
      locationData = {
        type: 'Point',
        coordinates: (dto as any).coordinates
      };
    } else {
      throw new Error('Location coordinates are required');
    }

    const listing = new this.listingModel({
      ...dto,
      photos: photoKeys, // Store only S3 keys
      location: locationData
    });
    
    const saved = await listing.save();
    
    // Return with pre-signed URLs
    return this.transformWithUrls(saved);
  }

  async findAll(filters?: SearchFilters): Promise<any[]> {
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

    if (filters?.coordinates && filters?.distance) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: filters.coordinates
          },
          $maxDistance: filters.distance * 1000
        }
      };
    }

    let queryBuilder = this.listingModel.find(query);

    if (filters?.searchText) {
      queryBuilder = queryBuilder.find({ $text: { $search: filters.searchText } });
    }

    const listings = await queryBuilder
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('providerId', 'name phone')
      .exec();

    // Transform all listings with pre-signed URLs
    return Promise.all(listings.map(listing => this.transformWithUrls(listing)));
  }

  async findNearby(coordinates: number[], maxDistance: number): Promise<any[]> {
    const listings = await this.listingModel.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: maxDistance * 1000
        }
      }
    })
    .populate('categoryId', 'name')
    .populate('subCategoryId', 'name')
    .populate('providerId', 'name phone')
    .exec();

    return Promise.all(listings.map(listing => this.transformWithUrls(listing)));
  }

  async findByProvider(providerId: string): Promise<any[]> {
    const listings = await this.listingModel.find({ providerId }).exec();
    return Promise.all(listings.map(listing => this.transformWithUrls(listing)));
  }

  async findById(id: string): Promise<any> {
    const listing = await this.listingModel
      .findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
      )
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('providerId')
      .exec();
      
    if (!listing) throw new NotFoundException('Listing not found');
    
    return this.transformWithUrls(listing);
  }

  async update(id: string, dto: UpdateListingDto): Promise<any> {
    const updateData: any = { ...dto };
    
    // Handle both coordinate formats for update as well
    if (dto.location && dto.location.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: dto.location.coordinates
      };
    } else if ((dto as any).coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: (dto as any).coordinates
      };
      delete updateData.coordinates;
    }

    const updated = await this.listingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
      
    if (!updated) throw new NotFoundException('Listing not found');
    
    return this.transformWithUrls(updated);
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

  // Helper method to transform listing with pre-signed URLs
  private async transformWithUrls(listing: ListingDocument): Promise<any> {
    const listingObj = listing.toObject();
    
    // Generate pre-signed URLs for all photos
    if (listing.photos && listing.photos.length > 0) {
      const photoUrls = await Promise.all(
        listing.photos.map(key => this.s3Service.getPresignedUrl(key))
      );
      listingObj.photoUrls = photoUrls;
    } else {
      listingObj.photoUrls = [];
    }
    
    // Remove the S3 keys from the response
    delete listingObj.photos;
    
    return listingObj;
  }

  // New method to refresh URLs for a specific listing
  async refreshUrls(listingId: string): Promise<{ photoUrls: string[] }> {
    const listing = await this.listingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundException('Listing not found');
    
    const photoUrls = await Promise.all(
      listing.photos.map(key => this.s3Service.getPresignedUrl(key))
    );
    
    return { photoUrls };
  }

  // Method to toggle listing status
  async toggleListingStatus(id: string, isActive: boolean): Promise<any> {
    const updated = await this.listingModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();
      
    if (!updated) throw new NotFoundException('Listing not found');
    
    return this.transformWithUrls(updated);
  }
}