import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commission, CommissionSchema } from './commissions.schema';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Commission.name, schema: CommissionSchema }])],
  providers: [CommissionsService],
  controllers: [CommissionsController],
})
export class CommissionsModule {}