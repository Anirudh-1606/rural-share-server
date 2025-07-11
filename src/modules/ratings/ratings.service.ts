import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from './ratings.schema';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async create(dto: CreateRatingDto): Promise<Rating> {
    const rating = new this.ratingModel(dto);
    return rating.save();
  }

  async findByOrder(orderId: string): Promise<Rating[]> {
    return this.ratingModel.find({ orderId }).exec();
  }

  async findByUser(userId: string): Promise<Rating[]> {
    return this.ratingModel.find({ ratedId: userId }).exec();
  }
}