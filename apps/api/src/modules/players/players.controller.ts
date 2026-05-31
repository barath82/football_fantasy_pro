import { Controller, Get, Logger, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerQueryDto } from './dto/player-query.dto';

@Controller('players')
export class PlayersController {
  private readonly logger = new Logger(PlayersController.name);

  constructor(private readonly playersService: PlayersService) {}

  @Get()
  async findAll(@Query() query: PlayerQueryDto) {
    try {
      return await this.playersService.findAll(query);
    } catch (err: any) {
      this.logger.error('findAll failed', err?.stack ?? err?.message);
      throw err;
    }
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('gameweek', new ParseIntPipe({ optional: true })) gameweek?: number,
  ) {
    return this.playersService.findOne(id, gameweek);
  }
}
