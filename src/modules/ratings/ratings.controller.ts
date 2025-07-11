import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly svc: RatingsService) {}

  @Post()
  create(@Body() dto: CreateRatingDto) {
    return this.svc.create(dto);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.svc.findByOrder(orderId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.svc.findByUser(userId);
  }
}