import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './listings.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { S3Service } from '../aws/s3.service';
import { UsersService } from '../users/users.service';
import { AddressesService } from '../addresses/addresses.service';
import { Catalogue, CatalogueDocument } from '../catalogue/catalogue.schema'; // Add this import

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
  excludeProviderId?: string;
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
    @InjectModel(Catalogue.name) private catalogueModel: Model<CatalogueDocument>, // Add this
    private readonly s3Service: S3Service,
    private readonly usersService: UsersService,
    private readonly addressesService: AddressesService, 
  ) {}

  async create(dto: CreateListingDto, files: Array<Express.Multer.File> = []): Promise<any> {
    // Upload files and get S3 keys
    const photoKeys = files && files.length > 0 
      ? await Promise.all(
          files.map(file => this.s3Service.uploadFile(file, 'listings'))
        )
      : [];
    
    console.log('Photo keys:', photoKeys);

    // Handle location data
    let locationData;
    
    // First check if location is provided in the DTO
    if (dto.location && dto.location.coordinates) {
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
      // If no location provided, use user's default address
      console.log('No location provided, fetching user default address...');
      
      const user = await this.usersService.getUserWithAddress(dto.providerId);
      
      if (user.defaultAddressId && user.defaultAddressId.coordinates) {
        console.log('Using user default address coordinates:', user.defaultAddressId.coordinates);
        locationData = {
          type: 'Point',
          coordinates: user.defaultAddressId.coordinates
        };
      } else {
        // If user has no default address, try to get their first address
        const userAddresses = await this.addressesService.findAllByUser(dto.providerId);
        if (userAddresses.length > 0 && userAddresses[0].coordinates) {
          console.log('Using user first address coordinates:', userAddresses[0].coordinates);
          locationData = {
            type: 'Point',
            coordinates: userAddresses[0].coordinates
          };
        } else {
          throw new BadRequestException('No address found for user. Please add an address to your profile first.');
        }
      }
    }

    const listing = new this.listingModel({
      ...dto,
      photos: photoKeys,
      location: locationData
    });
    
    const saved = await listing.save();
    
    // Return with pre-signed URLs
    return this.transformWithUrls(saved);
  }

  async findAll(filters?: SearchFilters): Promise<any[]> {
    try {
      console.log('ListingsService.findAll - Raw filters:', filters);
      
      const parsedFilters = this.parseSearchFilters(filters);
      console.log('ListingsService.findAll - Parsed filters:', parsedFilters);
      
      // Enhanced search logic: Check for category/subcategory matches first
      if (parsedFilters.searchText && parsedFilters.searchText.trim() && 
          !parsedFilters.categoryId && !parsedFilters.subCategoryId) {
        
        const searchTerm = parsedFilters.searchText.trim();
        console.log('Searching for category/subcategory match for:', searchTerm);
        
        // Step 1: Search for matching category (case-insensitive)
        const categoryMatch = await this.catalogueModel.findOne({
          name: new RegExp(`^${searchTerm}$`, 'i'),
          parentId: null // Categories have no parent
        }).exec();
        
        if (categoryMatch) {
          console.log('Found matching category:', categoryMatch.name);
          parsedFilters.categoryId = categoryMatch._id.toString();
          // Clear the search text since we're using category filter
          delete parsedFilters.searchText;
        } else {
          // Step 2: Search for matching subcategory
          const subCategoryMatch = await this.catalogueModel.findOne({
            name: new RegExp(`^${searchTerm}$`, 'i'),
            parentId: { $ne: null } // Subcategories have a parent
          }).exec();
          
          if (subCategoryMatch) {
            console.log('Found matching subcategory:', subCategoryMatch.name);
            parsedFilters.subCategoryId = subCategoryMatch._id.toString();
            // Clear the search text since we're using subcategory filter
            delete parsedFilters.searchText;
          } else {
            console.log('No category/subcategory match found, will search in descriptions only');
            // Keep searchText for description-only search
          }
        }
      }
      
      // Check if we need distance-based sorting
      const needsDistanceSort = parsedFilters.coordinates && parsedFilters.distance;
      
      let listings;
      
      if (needsDistanceSort) {
        // Use aggregation pipeline for distance-based search with sorting
        const pipeline: any[] = [];
        
        // Build the base query for geoNear
        const geoQuery: any = { isActive: parsedFilters.isActive ?? true };
        
        if (parsedFilters.categoryId) {
          geoQuery.categoryId = new (this.listingModel as any).base.Types.ObjectId(parsedFilters.categoryId);
        }
        
        if (parsedFilters.subCategoryId) {
          geoQuery.subCategoryId = new (this.listingModel as any).base.Types.ObjectId(parsedFilters.subCategoryId);
        }
        
        if (parsedFilters.excludeProviderId) {
          geoQuery.providerId = { $ne: new (this.listingModel as any).base.Types.ObjectId(parsedFilters.excludeProviderId) };
        }
        
        if (parsedFilters.priceMin !== null || parsedFilters.priceMax !== null) {
          const priceQuery: any = {};
          if (parsedFilters.priceMin !== null) {
            priceQuery.$gte = parsedFilters.priceMin;
          }
          if (parsedFilters.priceMax !== null) {
            priceQuery.$lte = parsedFilters.priceMax;
          }
          if (Object.keys(priceQuery).length > 0) {
            geoQuery.price = priceQuery;
          }
        }
        
        // Modified text search: only search in description if searchText exists
        if (parsedFilters.searchText && parsedFilters.searchText.trim()) {
          const searchRegex = new RegExp(parsedFilters.searchText.trim(), 'i');
          // Only search in description field
          geoQuery.description = searchRegex;
        }
        
        // Add geoNear stage with all filters included
        pipeline.push({
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: parsedFilters.coordinates
            },
            distanceField: 'distance',
            maxDistance: parsedFilters.distance * 1000, // Convert km to meters
            spherical: true,
            query: geoQuery // All filters are now in the geoNear query
          }
        });
        
        // Add lookups for populating references
        pipeline.push(
          {
            $lookup: {
              from: 'catalogues',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'categoryId'
            }
          },
          {
            $unwind: {
              path: '$categoryId',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'catalogues',
              localField: 'subCategoryId',
              foreignField: '_id',
              as: 'subCategoryId'
            }
          },
          {
            $unwind: {
              path: '$subCategoryId',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'providerId',
              foreignField: '_id',
              as: 'providerId'
            }
          },
          {
            $unwind: {
              path: '$providerId',
              preserveNullAndEmptyArrays: true
            }
          }
        );
        
        // Sort by distance (nearest first)
        pipeline.push({
          $sort: { distance: 1 }
        });
        
        console.log('Using aggregation pipeline for distance-based search');
        listings = await this.listingModel.aggregate(pipeline).exec();
        
      } else {
        // Regular query without distance sorting
        const query: any = { isActive: parsedFilters.isActive ?? true };
        
        if (parsedFilters.categoryId) {
          query.categoryId = parsedFilters.categoryId;
        }
        
        if (parsedFilters.subCategoryId) {
          query.subCategoryId = parsedFilters.subCategoryId;
        }
        
        if (parsedFilters.excludeProviderId) {
          query.providerId = { $ne: parsedFilters.excludeProviderId };
        }
        
        if (parsedFilters.priceMin !== null || parsedFilters.priceMax !== null) {
          const priceQuery: any = {};
          if (parsedFilters.priceMin !== null) {
            priceQuery.$gte = parsedFilters.priceMin;
          }
          if (parsedFilters.priceMax !== null) {
            priceQuery.$lte = parsedFilters.priceMax;
          }
          if (Object.keys(priceQuery).length > 0) {
            query.price = priceQuery;
          }
        }
        
        if (parsedFilters.tags && parsedFilters.tags.length > 0) {
          query.tags = { $in: parsedFilters.tags };
        }
        
        // Modified text search logic
        if (parsedFilters.searchText && parsedFilters.searchText.trim()) {
          // If we still have searchText here, it means no category/subcategory match was found
          // Search only in description field
          const searchRegex = new RegExp(parsedFilters.searchText.trim(), 'i');
          query.description = searchRegex;
        }
        
        listings = await this.listingModel.find(query)
          .populate('categoryId', 'name')
          .populate('subCategoryId', 'name')
          .populate('providerId', 'name phone')
          .sort({ createdAt: -1 })
          .exec();
      }
      
      // Transform all listings with pre-signed URLs
      return Promise.all(listings.map(listing => this.transformWithUrls(listing)));
      
    } catch (error) {
      console.error('ListingsService.findAll - Error:', error);
      throw new BadRequestException(`Failed to search listings: ${error.message}`);
    }
  }

  // Add this new method for smart search that can be called directly
  async smartSearch(searchText: string, otherFilters?: Partial<SearchFilters>): Promise<{
    listings: any[];
    searchType: 'category' | 'subcategory' | 'description';
    matchedTerm?: string;
  }> {
    const searchTerm = searchText.trim();
    let searchType: 'category' | 'subcategory' | 'description' = 'description';
    let matchedTerm: string | undefined;
    
    // Check for category match
    const categoryMatch = await this.catalogueModel.findOne({
      name: new RegExp(`^${searchTerm}$`, 'i'),
      parentId: null
    }).exec();
    
    if (categoryMatch) {
      searchType = 'category';
      matchedTerm = categoryMatch.name;
      const filters = {
        ...otherFilters,
        categoryId: categoryMatch._id.toString()
      };
      const listings = await this.findAll(filters);
      return { listings, searchType, matchedTerm };
    }
    
    // Check for subcategory match
    const subCategoryMatch = await this.catalogueModel.findOne({
      name: new RegExp(`^${searchTerm}$`, 'i'),
      parentId: { $ne: null }
    }).exec();
    
    if (subCategoryMatch) {
      searchType = 'subcategory';
      matchedTerm = subCategoryMatch.name;
      const filters = {
        ...otherFilters,
        subCategoryId: subCategoryMatch._id.toString()
      };
      const listings = await this.findAll(filters);
      return { listings, searchType, matchedTerm };
    }
    
    // Fall back to description search
    const filters = {
      ...otherFilters,
      searchText: searchTerm
    };
    const listings = await this.findAll(filters);
    return { listings, searchType };
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