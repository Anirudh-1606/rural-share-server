import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from './listings.schema';
import { Availability, AvailabilitySchema } from './availability.schema';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { AvailabilitiesService } from './availabilities.service';
import { AvailabilitiesController } from './availabilities.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Listing.name, schema: ListingSchema },
      { name: Availability.name, schema: AvailabilitySchema },
    ]),
  ],
  providers: [ListingsService, AvailabilitiesService],
  controllers: [ListingsController, AvailabilitiesController],
  exports: [],
})
export class ListingsModule {}