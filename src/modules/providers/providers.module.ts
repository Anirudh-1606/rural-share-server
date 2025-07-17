import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { OrdersModule } from '../orders/orders.module';
import { ListingsModule } from '../listings/listings.module';
import { RatingsModule } from '../ratings/ratings.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    OrdersModule,
    ListingsModule,
    RatingsModule,
    UsersModule,
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
})
export class ProvidersModule {}