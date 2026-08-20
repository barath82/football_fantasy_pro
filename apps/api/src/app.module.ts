import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import fplConfig from './config/fpl.config';
import authConfig from './config/auth.config';
import emailConfig from './config/email.config';
import { Season } from './database/entities/season.entity';
import { Team } from './database/entities/team.entity';
import { Position } from './database/entities/position.entity';
import { Player } from './database/entities/player.entity';
import { Gameweek } from './database/entities/gameweek.entity';
import { Fixture } from './database/entities/fixture.entity';
import { PlayerGameweekStat } from './database/entities/player-gameweek-stat.entity';
import { OwnershipSnapshot } from './database/entities/ownership-snapshot.entity';
import { PriceHistory } from './database/entities/price-history.entity';
import { ApiSyncLog } from './database/entities/api-sync-log.entity';
import { User } from './database/entities/user.entity';
import { PasswordResetToken } from './database/entities/password-reset-token.entity';
import { Pick } from './database/entities/pick.entity';
import { SyncModule } from './modules/sync/sync.module';
import { PlayersModule } from './modules/players/players.module';
import { TeamsModule } from './modules/teams/teams.module';
import { GameweeksModule } from './modules/gameweeks/gameweeks.module';
import { FixturesModule } from './modules/fixtures/fixtures.module';
import { AuthModule } from './modules/auth/auth.module';
import { PicksModule } from './modules/picks/picks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, fplConfig, authConfig, emailConfig],
      envFilePath: ['../../.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        database: config.get('database.name'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        entities: [
          Season, Team, Position, Player, Gameweek,
          Fixture, PlayerGameweekStat, OwnershipSnapshot,
          PriceHistory, ApiSyncLog, User, Pick, PasswordResetToken,
        ],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        logging: config.get('app.nodeEnv') === 'development',
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
    }),
    ScheduleModule.forRoot(),
    SyncModule,
    PlayersModule,
    TeamsModule,
    GameweeksModule,
    FixturesModule,
    AuthModule,
    PicksModule,
  ],
})
export class AppModule {}
