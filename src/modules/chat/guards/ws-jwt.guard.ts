import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient();
      const userId = client.userId;
      
      if (!userId) {
        throw new WsException('Unauthorized');
      }
      
      return true;
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}