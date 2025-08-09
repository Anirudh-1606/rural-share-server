// src/modules/listings/listings.controller.ts
import { Controller, Post, Get, Patch, Delete, Param, Body, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('listings')
export class ListingsController {
  constructor(private readonly svc: ListingsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10))
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('data') dataString: string,
  ) {
    console.log('Received files:', files?.length || 0);
    
    // Parse JSON data
    const listingData = JSON.parse(dataString);
    
    const dto: CreateListingDto = {
      ...listingData,
    };
    
    console.log('CreateListingDto:', dto);
    return this.svc.create(dto, files);
  }

  @Get()
  findAll(@Query() filters?: any) {
    return this.svc.findAll(filters);
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId') providerId: string) {
    return this.svc.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.delete(id);
  }

  // New endpoint to refresh pre-signed URLs
  @Post(':id/refresh-urls')
  refreshUrls(@Param('id') id: string) {
    return this.svc.refreshUrls(id);
  }
}