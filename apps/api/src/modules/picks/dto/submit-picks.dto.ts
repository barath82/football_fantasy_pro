import { IsIn, IsInt } from 'class-validator';

const FORMATIONS = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];

export class SubmitPicksDto {
  @IsInt()
  gameweekFplId: number;

  @IsInt()
  transferInPlayerId: number;

  @IsInt()
  transferOutPlayerId: number;

  @IsInt()
  differentialSucceedPlayerId: number;

  @IsInt()
  differentialBlankPlayerId: number;

  @IsIn(FORMATIONS)
  formation: string;

  @IsInt()
  captainPlayerId: number;
}
