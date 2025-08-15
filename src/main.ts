import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRefreshInterceptor } from './common/interceptors/token-refresh.interceptor';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const jwtService = app.get(JwtService);
  app.useGlobalInterceptors(new TokenRefreshInterceptor(jwtService));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  app.enableCors({
    origin: '*', // or specify your mobile app's origin
  });
  
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
  console.log(`Server listening on port ${process.env.PORT}`);
}
bootstrap();
