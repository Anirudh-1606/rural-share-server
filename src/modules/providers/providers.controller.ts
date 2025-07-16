import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdatePreferencesDto } from '../users/dto/update-preferences.dto';

@Controller('providers')
@UseGuards(AuthGuard('jwt'))
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get(':providerId/dashboard')
  getDashboard(@Param('providerId') providerId: string) {
    return this.providersService.getProviderDashboard(providerId);
  }

  @Get(':providerId/bookings')
  getBookings(@Param('providerId') providerId: string) {
    return this.providersService.getProviderBookings(providerId);
  }

  @Get(':providerId/bookings/active')
  getActiveBookings(@Param('providerId') providerId: string) {
    return this.providersService.getActiveBookings(providerId);
  }

  @Get(':providerId/bookings/completed')
  getCompletedBookings(@Param('providerId') providerId: string) {
    return this.providersService.getCompletedBookings(providerId);
  }

  @Get(':providerId/bookings/to-review')
  getBookingsToReview(@Param('providerId') providerId: string) {
    return this.providersService.getBookingsToReview(providerId);
  }

  @Patch('preferences')
  updatePreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    return this.providersService.updateUserPreferences(req.user.userId, dto);
  }
}