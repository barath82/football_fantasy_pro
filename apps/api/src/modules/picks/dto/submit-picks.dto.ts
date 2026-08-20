import { IsIn, IsInt, IsOptional } from 'class-validator';

const FORMATIONS = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];
const CHIPS = ['wildcard', 'free_hit', 'bench_boost', 'triple_captain'];

export class SubmitPicksDto {
  @IsInt()
  gameweekFplId: number;

  // Not applicable in Gameweek 1 (Transfer Guru is disabled — no prior
  // squad yet to judge a transfer against), so both are optional.
  @IsOptional()
  @IsInt()
  transferInPlayerId?: number;

  @IsOptional()
  @IsInt()
  transferOutPlayerId?: number;

  @IsInt()
  differentialSucceedPlayerId: number;

  @IsInt()
  differentialBlankPlayerId: number;

  @IsIn(FORMATIONS)
  formation: string;

  @IsInt()
  captainPlayerId: number;

  @IsOptional()
  @IsIn(CHIPS)
  chipPick?: string;

  @IsOptional()
  @IsInt()
  csSucceedTeamId?: number;

  @IsOptional()
  @IsInt()
  csFailTeamId?: number;
}
