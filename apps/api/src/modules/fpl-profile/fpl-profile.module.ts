import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../../database/entities/player.entity';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Season } from '../../database/entities/season.entity';
import { OwnershipSnapshot } from '../../database/entities/ownership-snapshot.entity';
import { SyncModule } from '../sync/sync.module';
import { AuthModule } from '../auth/auth.module';
import { FplProfileService } from './fpl-profile.service';
import { GameweekReviewService } from './gameweek-review.service';
import { FplProfileController } from './fpl-profile.controller';

@Module({
  imports: [SyncModule, AuthModule, TypeOrmModule.forFeature([Player, Gameweek, Season, OwnershipSnapshot])],
  providers: [FplProfileService, GameweekReviewService],
  controllers: [FplProfileController],
})
export class FplProfileModule {}
