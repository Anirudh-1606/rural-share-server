import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ListingsService } from '../listings/listings.service';
import { RatingsService } from '../ratings/ratings.service';
import { UsersService } from '../users/users.service';
import { OrderStatus } from '../orders/dto/create-order.dto';
import { UpdatePreferencesDto } from '../users/dto/update-preferences.dto';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly listingsService: ListingsService,
    private readonly ratingsService: RatingsService,
    private readonly usersService: UsersService,
  ) {}

  async getProviderDashboard(providerId: string) {
    // Get summary statistics
    const summary = await this.ordersService.getProviderSummary(providerId);
    
    // Get active listings count
    const listings = await this.listingsService.findByProvider(providerId);
    const activeListings = listings.filter(l => l.isActive).length;
    
    // Get average rating
    const ratings = await this.ratingsService.findByUser(providerId);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length 
      : 0;

    // Get recent bookings
    const recentBookings = await this.ordersService.findByProvider(providerId);
    const recent = recentBookings
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return {
      summary: {
        totalBookings: summary.totalOrders,
        completedBookings: summary.fulfilledOrders,
        revenue: summary.revenue,
        activeListings,
        averageRating: Number(avgRating.toFixed(1)),
        totalRatings: ratings.length
      },
      recentBookings: recent
    };
  }

  async getProviderBookings(providerId: string) {
    const bookings = await this.ordersService.findByProvider(providerId);
    
    return {
      active: bookings.filter(b => 
        [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PAID].includes(b.status as OrderStatus)
      ),
      completed: bookings.filter(b => b.status === OrderStatus.COMPLETED),
      canceled: bookings.filter(b => b.status === OrderStatus.CANCELED),
      toReview: await this.getBookingsNeedingReview(providerId, bookings)
    };
  }

  async getActiveBookings(providerId: string) {
    const bookings = await this.ordersService.findByProvider(providerId);
    return bookings.filter(b => 
      [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PAID].includes(b.status as OrderStatus)
    );
  }

  async getCompletedBookings(providerId: string) {
    const bookings = await this.ordersService.findByProvider(providerId);
    return bookings.filter(b => b.status === OrderStatus.COMPLETED);
  }

  async getBookingsToReview(providerId: string) {
    const completedBookings = await this.getCompletedBookings(providerId);
    return this.getBookingsNeedingReview(providerId, completedBookings);
  }

  private async getBookingsNeedingReview(providerId: string, bookings: any[]) {
    const toReview = [];
    
    for (const booking of bookings) {
      if (booking.status === OrderStatus.COMPLETED) {
        const ratings = await this.ratingsService.findByOrder(booking._id.toString());
        const hasProviderRated = ratings.some(r => 
          r.raterId.toString() === providerId
        );
        
        if (!hasProviderRated) {
          toReview.push(booking);
        }
      }
    }
    
    return toReview;
  }

  async updateUserPreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(userId, dto);
  }
}
