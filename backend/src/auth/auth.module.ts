import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({})   // no secret / signOptions by default: AuthService and RefreshTokenGuard pass the secret + expiresIn on every call, reading them from ConfigService
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
