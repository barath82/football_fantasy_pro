import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from '../../database/entities/season.entity';
import { Team } from '../../database/entities/team.entity';
import { Position } from '../../database/entities/position.entity';
import { Player } from '../../database/entities/player.entity';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Fixture } from '../../database/entities/fixture.entity';
import { PlayerGameweekStat } from '../../database/entities/player-gameweek-stat.entity';
import { OwnershipSnapshot } from '../../database/entities/ownership-snapshot.entity';
import { PriceHistory } from '../../database/entities/price-history.entity';
import { ApiSyncLog } from '../../database/entities/api-sync-log.entity';
import { FplApiService } from './fpl-api.service';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Season, Team, Position, Player, Gameweek,
      Fixture, PlayerGameweekStat, OwnershipSnapshot,
      PriceHistory, ApiSyncLog,
    ]),
  ],
  providers: [FplApiService, SyncService],
  controllers: [SyncController],
  exports: [SyncService, FplApiService],
})
export class SyncModule {}
