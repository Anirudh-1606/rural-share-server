import { Controller, Post, Get, Patch, Delete, Param, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('listings')
export class ListingsController {
  constructor(private readonly svc: ListingsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10))
  create(
    @Body() dto: CreateListingDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.svc.create(dto, files);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
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
}