import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly svc: EscrowService) {}

  @Post()
  create(@Body() dto: CreateEscrowDto) {
    return this.svc.create(dto);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.svc.findByOrder(orderId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('status') status: string) {
    return this.svc.update(id, status);
  }
}