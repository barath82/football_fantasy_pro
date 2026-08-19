import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PicksService } from './picks.service';
import { SubmitPicksDto } from './dto/submit-picks.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthedRequest } from '../auth/auth.guard';

@Controller('picks')
@UseGuards(AuthGuard)
export class PicksController {
  constructor(private readonly picks: PicksService) {}

  @Post()
  submit(@Req() req: AuthedRequest, @Body() dto: SubmitPicksDto) {
    return this.picks.submit(req.user.id, dto);
  }

  @Get('me')
  findMine(@Req() req: AuthedRequest, @Query('gameweek') gameweek: string) {
    return this.picks.findMine(req.user.id, parseInt(gameweek, 10));
  }

  @Get('mine')
  findAllMine(@Req() req: AuthedRequest) {
    return this.picks.findAllMine(req.user.id);
  }
}
