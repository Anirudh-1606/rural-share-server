import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './listings.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { S3Service } from '../aws/s3.service';

export interface SearchFilters {
  categoryId?: string;
  subCategoryId?: string;
  priceMin?: number | string;
  priceMax?: number | string;
  distance?: number | string;
  coordinates?: number[] | string;
  searchText?: string;
  isActive?: boolean | string;
  providerId?: string;
  excludeProviderId?: string; // ADD THIS
  tags?: string | string[];
  // Additional fields from app
  date?: string;
  latitude?: number | string;
  longitude?: number | string;
  radius?: number | string;
  text?: string;
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
    try {
      console.log('ListingsService.findAll - Raw filters:', filters);
      
      // Parse and validate filters
      const parsedFilters = this.parseSearchFilters(filters);
      
      console.log('ListingsService.findAll - Parsed filters:', parsedFilters);
      
      const query: any = { isActive: parsedFilters.isActive ?? true };

      // Build query conditions
      if (parsedFilters.categoryId) {
        query.categoryId = parsedFilters.categoryId;
      }

      if (parsedFilters.subCategoryId) {
        query.subCategoryId = parsedFilters.subCategoryId;
      }

      if (parsedFilters.providerId) {
        query.providerId = parsedFilters.providerId;
      }

      // EXCLUDE listings from specific provider (current user)
      if (parsedFilters.excludeProviderId) {
        query.providerId = { $ne: parsedFilters.excludeProviderId };
      }

      // Handle price range with proper number parsing
      if (parsedFilters.priceMin !== null || parsedFilters.priceMax !== null) {
        const priceQuery: any = {};
        if (parsedFilters.priceMin !== null) {
          priceQuery.$gte = parsedFilters.priceMin;
        }
        if (parsedFilters.priceMax !== null) {
          priceQuery.$lte = parsedFilters.priceMax;
        }
        // Only add price query if it has constraints
        if (Object.keys(priceQuery).length > 0) {
          query.price = priceQuery;
        }
      }

      if (parsedFilters.tags && parsedFilters.tags.length > 0) {
        query.tags = { $in: parsedFilters.tags };
      }

      // Clean the query object to remove any undefined or "undefined" values
      const cleanQuery = Object.entries(query).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== 'undefined' && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Build the query in stages to avoid conflicts
      let queryBuilder;
      
      // Check if we're doing a text search
      if (parsedFilters.searchText && parsedFilters.searchText.trim()) {
        // For text search, we need to structure the query differently
        // MongoDB doesn't allow combining $text with $near
        if (parsedFilters.coordinates && parsedFilters.distance) {
          console.log('ListingsService.findAll - Warning: Cannot combine text search with location search. Using text search only.');
        }
        
        // Create a new query object for text search
        const textSearchQuery = {
          $text: { $search: parsedFilters.searchText },
          ...cleanQuery  // Include other filters
        };
        
        queryBuilder = this.listingModel.find(textSearchQuery);
      } else if (parsedFilters.coordinates && parsedFilters.distance) {
        // Location-based search without text
        queryBuilder = this.listingModel.find(cleanQuery);
      } else {
        // Regular query without text or location search
        queryBuilder = this.listingModel.find(cleanQuery);
      }

      console.log('ListingsService.findAll - Final query:', JSON.stringify(cleanQuery, null, 2));
      console.log('ListingsService.findAll - Executing query...');

      const listings = await queryBuilder
        .populate('categoryId', 'name')
        .populate('subCategoryId', 'name')
        .populate('providerId', 'name phone')
        .sort({ createdAt: -1 }) // Most recent first
        .exec();

      // Transform all listings with pre-signed URLs
      return Promise.all(listings.map(listing => this.transformWithUrls(listing)));
    } catch (error) {
      console.error('ListingsService.findAll - Error:', error);
      throw new BadRequestException(`Failed to search listings: ${error.message}`);
    }
  }

  // Helper method to parse and validate search filters
  private parseSearchFilters(filters: any): any {
    const parsed: any = {};
    
    // Parse boolean values
    if (filters?.isActive !== undefined) {
      parsed.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    
    // Parse numeric values
    if (filters?.priceMin !== undefined && filters.priceMin !== 'undefined' && filters.priceMin !== '') {
      const priceMin = parseFloat(filters.priceMin);
      parsed.priceMin = isNaN(priceMin) ? null : priceMin;
    } else {
      parsed.priceMin = null;
    }
    
    if (filters?.priceMax !== undefined && filters.priceMax !== 'undefined' && filters.priceMax !== '') {
      const priceMax = parseFloat(filters.priceMax);
      parsed.priceMax = isNaN(priceMax) ? null : priceMax;
    } else {
      parsed.priceMax = null;
    }
    
    // Parse coordinates
    if (filters?.coordinates) {
      if (typeof filters.coordinates === 'string') {
        try {
          parsed.coordinates = JSON.parse(filters.coordinates);
        } catch (e) {
          // Try parsing as comma-separated values
          const coords = filters.coordinates.split(',').map(c => parseFloat(c.trim()));
          if (coords.length === 2 && !coords.some(isNaN)) {
            parsed.coordinates = coords;
          }
        }
      } else if (Array.isArray(filters.coordinates)) {
        parsed.coordinates = filters.coordinates.map(c => parseFloat(c));
      }
    } else if (filters?.latitude && filters?.longitude) {
      // Handle case where app sends latitude/longitude separately
      const lat = parseFloat(filters.latitude);
      const lng = parseFloat(filters.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        parsed.coordinates = [lng, lat]; // MongoDB expects [longitude, latitude]
      }
    }
    
    // Handle radius/distance
    if (filters?.distance !== undefined && filters.distance !== 'undefined' && filters.distance !== '') {
      const distance = parseFloat(filters.distance);
      parsed.distance = isNaN(distance) ? null : distance;
    } else if (filters?.radius !== undefined && filters.radius !== 'undefined' && filters.radius !== '') {
      // Handle case where app sends 'radius' instead of 'distance'
      const radius = parseFloat(filters.radius);
      parsed.distance = isNaN(radius) ? null : radius;
    }
    
    // Copy string values as-is
    if (filters?.searchText && filters.searchText !== 'undefined') {
      parsed.searchText = filters.searchText;
    } else if (filters?.text && filters.text !== 'undefined') {
      // Handle case where app sends 'text' instead of 'searchText'
      parsed.searchText = filters.text;
    }
    
    if (filters?.categoryId && filters.categoryId !== 'undefined') {
      parsed.categoryId = filters.categoryId;
    }
    
    if (filters?.subCategoryId && filters.subCategoryId !== 'undefined') {
      parsed.subCategoryId = filters.subCategoryId;
    }
    
    if (filters?.providerId && filters.providerId !== 'undefined') {
      parsed.providerId = filters.providerId;
    }
    
    // PARSE excludeProviderId
    if (filters?.excludeProviderId && filters.excludeProviderId !== 'undefined') {
      parsed.excludeProviderId = filters.excludeProviderId;
    }
    
    // Parse tags array
    if (filters?.tags) {
      if (typeof filters.tags === 'string') {
        parsed.tags = [filters.tags];
      } else if (Array.isArray(filters.tags)) {
        parsed.tags = filters.tags;
      }
    }
    
    return parsed;
  }

  async findNearby(coordinates: number[], maxDistance: number, excludeProviderId?: string): Promise<any[]> {
    const query: any = {
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
    };

    // Exclude listings from specific provider if provided
    if (excludeProviderId) {
      query.providerId = { $ne: excludeProviderId };
    }

    const listings = await this.listingModel.find(query)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('providerId', 'name phone')
      .exec();

    return Promise.all(listings.map(listing => this.transformWithUrls(listing)));
  }

  async findByProvider(providerId: string): Promise<any[]> {
    const listings = await this.listingModel
      .find({ providerId })
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .sort({ createdAt: -1 })
      .exec();
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
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('providerId')
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
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('providerId')
      .exec();
      
    if (!updated) throw new NotFoundException('Listing not found');
    
    return this.transformWithUrls(updated);
  }
}