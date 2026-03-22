import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { PromptModule } from './prompt/prompt.module';
import { MenuModule } from './menu/menu.module';
import { TelegramModule } from './telegram/telegram.module';
import { FavoritesModule } from './favorites/favorites.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Глобальный rate limiter: 60 запросов в минуту на IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    ProductModule,
    PromptModule,
    MenuModule,
    TelegramModule,
    FavoritesModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Применяем ThrottlerGuard глобально
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
