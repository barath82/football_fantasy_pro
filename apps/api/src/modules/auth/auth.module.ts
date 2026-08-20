import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { User } from '../../database/entities/user.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { EmailModule } from '../email/email.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetToken]),
    JwtModule.register({}),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    EmailModule,
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
