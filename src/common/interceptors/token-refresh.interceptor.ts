import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check if request has a valid JWT token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next.handle();
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return next.handle();
      }

      // Check if token expires in less than 5 minutes
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) { // Less than 5 minutes but not expired
        // Generate a new token with the same payload
        const { iat, exp, ...payload } = decoded;
        const newToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        
        // Add new token to response headers
        response.setHeader('X-New-Token', newToken);
        response.setHeader('X-Token-Expires-In', '900'); // 15 minutes
        response.setHeader('Access-Control-Expose-Headers', 'X-New-Token, X-Token-Expires-In');
      }
    } catch (error) {
      // If token is invalid, just continue without refreshing
      console.error('TokenRefreshInterceptor error:', error.message);
    }

    return next.handle();
  }
}