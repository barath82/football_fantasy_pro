import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../../database/entities/player.entity';
import { Season } from '../../database/entities/season.entity';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Season])],
  providers: [PlayersService],
  controllers: [PlayersController],
})
export class PlayersModule {}
