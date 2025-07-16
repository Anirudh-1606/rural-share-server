import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Catalogue, CatalogueSchema } from './catalogue.schema';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Catalogue.name, schema: CatalogueSchema }]),
  ],
  providers: [CatalogueService],
  controllers: [CatalogueController],
  exports: [CatalogueService],
})
export class CatalogueModule {}