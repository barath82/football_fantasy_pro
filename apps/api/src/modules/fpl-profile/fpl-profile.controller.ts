import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthedRequest } from '../auth/auth.guard';
import { FplProfileService } from './fpl-profile.service';
import { GameweekReviewService } from './gameweek-review.service';

@Controller('me/fpl')
@UseGuards(AuthGuard)
export class FplProfileController {
  constructor(
    private readonly fplProfile: FplProfileService,
    private readonly gameweekReview: GameweekReviewService,
  ) {}

  @Get('snapshot')
  getSnapshot(@Req() req: AuthedRequest) {
    return this.fplProfile.getSnapshot(req.user.fplTeamId);
  }

  @Get('leagues')
  getLeagues(@Req() req: AuthedRequest) {
    return this.fplProfile.getLeagues(req.user.fplTeamId);
  }

  @Get('leagues/:leagueId/standings')
  getLeagueStandings(@Req() req: AuthedRequest, @Param('leagueId', ParseIntPipe) leagueId: number) {
    return this.fplProfile.getLeagueStandings(req.user.fplTeamId, leagueId);
  }

  @Get('transfers')
  getTransfers(@Req() req: AuthedRequest) {
    return this.fplProfile.getTransfers(req.user.fplTeamId);
  }

  @Get('review')
  getReview(@Req() req: AuthedRequest, @Query('gameweek') gameweek?: string) {
    const gw = gameweek ? parseInt(gameweek, 10) : undefined;
    return this.gameweekReview.getReview(req.user.fplTeamId, gw);
  }

  @Get('season')
  getSeasonContext(@Req() req: AuthedRequest) {
    return this.gameweekReview.getSeasonContext(req.user.fplTeamId);
  }
}
