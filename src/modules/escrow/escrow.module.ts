import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Escrow, EscrowSchema } from './escrow.schema';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Escrow.name, schema: EscrowSchema }]),
    OrdersModule,
  ],
  providers: [EscrowService],
  controllers: [EscrowController],
  exports: [EscrowService],
})
export class EscrowModule {}