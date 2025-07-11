import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto } from './dto/create-commission.dto';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly svc: CommissionsService) {}

  @Post()
  create(@Body() dto: CreateCommissionDto) {
    return this.svc.create(dto);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.svc.findByOrder(orderId);
  }
}