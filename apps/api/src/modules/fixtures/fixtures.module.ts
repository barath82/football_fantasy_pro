import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from '../../database/entities/season.entity';
import { Team } from '../../database/entities/team.entity';
import { FixturesService } from './fixtures.service';
import { FixturesController } from './fixtures.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Season, Team])],
  providers: [FixturesService],
  controllers: [FixturesController],
})
export class FixturesModule {}
