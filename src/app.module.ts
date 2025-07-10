import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
// … import other feature modules

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
      // useCreateIndex etc. if needed
    }),
    UsersModule,
    // … ListingsModule, OrdersModule, etc.
  ],
})
export class AppModule {}
