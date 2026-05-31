import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Season } from '../../database/entities/season.entity';
import { GameweeksService } from './gameweeks.service';
import { GameweeksController } from './gameweeks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gameweek, Season])],
  providers: [GameweeksService],
  controllers: [GameweeksController],
})
export class GameweeksModule {}
