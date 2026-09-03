import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthedRequest } from '../auth/auth.guard';
import { FplProfileService } from './fpl-profile.service';

@Controller('me/fpl')
@UseGuards(AuthGuard)
export class FplProfileController {
  constructor(private readonly fplProfile: FplProfileService) {}

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
}
