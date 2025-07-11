import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module'
import { KycModule } from './modules/kyc/kyc.module';
import { ListingsModule } from './modules/listings/listings.module';
import databaseConfig from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: [
        // `.env.${process.env.NODE_ENV || 'development'}`,
        '.env' 
      ],
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: 
          (process.env.NODE_ENV === 'production')
            ? cfg.get<string>('database.uriProd')
            : cfg.get<string>('database.uriDev'),
        // you can also supply dbName, useNewUrlParser, etc.
      }),
    }),
    UsersModule,
    AuthModule,
    KycModule,
    ListingsModule
  ],
})
export class AppModule {}