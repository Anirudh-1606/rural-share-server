import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dispute, DisputeSchema } from './disputes.schema';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { OrdersModule } from '../orders/orders.module';
import { EscrowModule } from '../escrow/escrow.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dispute.name, schema: DisputeSchema }]),
    OrdersModule,
    EscrowModule,
  ],
  providers: [DisputesService],
  controllers: [DisputesController],
  exports: [DisputesService],
})
export class DisputesModule {}