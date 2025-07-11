import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Escrow, EscrowSchema } from './escrow.schema';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Escrow.name, schema: EscrowSchema }])],
  providers: [EscrowService],
  controllers: [EscrowController],
})
export class EscrowModule {}