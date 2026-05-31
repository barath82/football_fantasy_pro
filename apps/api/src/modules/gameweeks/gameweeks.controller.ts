import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GameweeksService } from './gameweeks.service';

@Controller('gameweeks')
export class GameweeksController {
  constructor(private readonly gameweeksService: GameweeksService) {}

  @Get()
  findAll() {
    return this.gameweeksService.findAll();
  }

  @Get(':gw')
  findOne(@Param('gw', ParseIntPipe) gw: number) {
    return this.gameweeksService.findOne(gw);
  }
}
