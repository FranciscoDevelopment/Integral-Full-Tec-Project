import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { CommonModule } from './common/common.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './auth/guards/auth/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CollaborationsModule } from './collaborations/collaborations.module';

@Module({
  imports: [
    // Generous on purpose: normal browsing never gets close. The signin has its own, stricter limit
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 600 }]),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    UsersModule,
    AuthModule,
    CollaborationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // 1°
    { provide: APP_GUARD, useClass: AuthGuard }, // 2°
    { provide: APP_GUARD, useClass: RolesGuard }, // 3°
  ],
})
export class AppModule {}