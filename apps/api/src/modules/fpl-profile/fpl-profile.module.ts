import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../../database/entities/player.entity';
import { SyncModule } from '../sync/sync.module';
import { AuthModule } from '../auth/auth.module';
import { FplProfileService } from './fpl-profile.service';
import { FplProfileController } from './fpl-profile.controller';

@Module({
  imports: [SyncModule, AuthModule, TypeOrmModule.forFeature([Player])],
  providers: [FplProfileService],
  controllers: [FplProfileController],
})
export class FplProfileModule {}
