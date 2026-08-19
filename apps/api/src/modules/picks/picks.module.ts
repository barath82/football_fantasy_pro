import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pick } from '../../database/entities/pick.entity';
import { Gameweek } from '../../database/entities/gameweek.entity';
import { Season } from '../../database/entities/season.entity';
import { PicksService } from './picks.service';
import { PicksController } from './picks.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pick, Gameweek, Season]), AuthModule],
  providers: [PicksService],
  controllers: [PicksController],
})
export class PicksModule {}
