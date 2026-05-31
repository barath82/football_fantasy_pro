import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../database/entities/team.entity';
import { Season } from '../../database/entities/season.entity';
import { Player } from '../../database/entities/player.entity';
import { TeamsController } from './teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Season, Player])],
  controllers: [TeamsController],
})
export class TeamsModule {}
