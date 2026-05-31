// Shared API response shapes used by both backend and frontend

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PlayerDto {
  id: number;
  fplId: number;
  webName: string;
  firstName: string;
  secondName: string;
  team: TeamDto;
  position: PositionDto;
  status: string;
  news: string;
  nowCost: number;
  costChangeStart: number;
  selectedByPercent: number;
  totalPoints: number;
  pointsPerGame: number;
  form: number;
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: number;
  creativity: number;
  threat: number;
  ictIndex: number;
  transfersIn: number;
  transfersOut: number;
}

export interface TeamDto {
  id: number;
  fplId: number;
  name: string;
  shortName: string;
  code: number;
  strengthOverallHome: number;
  strengthOverallAway: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
}

export interface PositionDto {
  id: number;
  fplId: number;
  singularName: string;
  singularNameShort: string;
  pluralName: string;
}

export interface GameweekDto {
  id: number;
  fplId: number;
  name: string;
  deadlineTime: string;
  averageEntryScore: number;
  highestScore: number;
  finished: boolean;
  isCurrent: boolean;
  isNext: boolean;
  isPrevious: boolean;
  transfersMade: number;
}

export interface FixtureDto {
  id: number;
  fplId: number;
  gameweekId: number;
  teamH: TeamDto;
  teamA: TeamDto;
  teamHScore: number | null;
  teamAScore: number | null;
  kickoffTime: string;
  finished: boolean;
  teamHDifficulty: number;
  teamADifficulty: number;
}

export interface PlayerGameweekStatDto {
  id: number;
  player: PlayerDto;
  gameweekId: number;
  fixtureId: number;
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  bps: number;
  totalPoints: number;
  value: number;
  selected: number;
  transfersIn: number;
  transfersOut: number;
  wasHome: boolean;
}

export interface PlayerFilterParams {
  gameweek?: number;
  teamId?: number;
  positionId?: number;
  minOwnership?: number;
  maxOwnership?: number;
  minPrice?: number;
  maxPrice?: number;
  minPoints?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}
