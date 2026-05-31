import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Season } from './season.entity';
import { Team } from './team.entity';
import { Position } from './position.entity';
import { PlayerGameweekStat } from './player-gameweek-stat.entity';
import { OwnershipSnapshot } from './ownership-snapshot.entity';
import { PriceHistory } from './price-history.entity';

@Entity('players')
@Index(['fplId', 'seasonId'], { unique: true })
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fpl_id' })
  fplId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  @ManyToOne(() => Season, (s) => s.players)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @ManyToOne(() => Team, (t) => t.players)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'team_id' })
  teamId: number;

  @ManyToOne(() => Position, (p) => p.players)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ name: 'position_id' })
  positionId: number;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'second_name', length: 100 })
  secondName: string;

  @Column({ name: 'web_name', length: 100 })
  webName: string;

  @Column({ type: 'int', nullable: true })
  code: number | null;

  @Column({ length: 1, default: 'a' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  news: string | null;

  // Cost in tenths of millions (e.g. 65 = £6.5m)
  @Column({ name: 'now_cost', type: 'int', nullable: true })
  nowCost: number | null;

  @Column({ name: 'cost_change_start', type: 'int', nullable: true })
  costChangeStart: number | null;

  @Column({ name: 'cost_change_event', type: 'int', nullable: true })
  costChangeEvent: number | null;

  @Column({ name: 'selected_by_percent', type: 'decimal', precision: 6, scale: 2, nullable: true })
  selectedByPercent: number;

  @Column({ name: 'total_points', default: 0 })
  totalPoints: number;

  @Column({ name: 'points_per_game', type: 'decimal', precision: 6, scale: 2, nullable: true })
  pointsPerGame: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  form: number;

  @Column({ name: 'value_form', type: 'decimal', precision: 6, scale: 2, nullable: true })
  valueForm: number;

  @Column({ name: 'value_season', type: 'decimal', precision: 6, scale: 2, nullable: true })
  valueSeason: number;

  // Cumulative season stats
  @Column({ default: 0 })
  minutes: number;

  @Column({ name: 'goals_scored', default: 0 })
  goalsScored: number;

  @Column({ default: 0 })
  assists: number;

  @Column({ name: 'clean_sheets', default: 0 })
  cleanSheets: number;

  @Column({ name: 'goals_conceded', default: 0 })
  goalsConceded: number;

  @Column({ name: 'own_goals', default: 0 })
  ownGoals: number;

  @Column({ name: 'penalties_saved', default: 0 })
  penaltiesSaved: number;

  @Column({ name: 'penalties_missed', default: 0 })
  penaltiesMissed: number;

  @Column({ name: 'yellow_cards', default: 0 })
  yellowCards: number;

  @Column({ name: 'red_cards', default: 0 })
  redCards: number;

  @Column({ default: 0 })
  saves: number;

  @Column({ default: 0 })
  bonus: number;

  @Column({ default: 0 })
  bps: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  influence: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creativity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  threat: number;

  @Column({ name: 'ict_index', type: 'decimal', precision: 10, scale: 2, nullable: true })
  ictIndex: number;

  @Column({ name: 'transfers_in', default: 0 })
  transfersIn: number;

  @Column({ name: 'transfers_out', default: 0 })
  transfersOut: number;

  @Column({ name: 'transfers_in_event', default: 0 })
  transfersInEvent: number;

  @Column({ name: 'transfers_out_event', default: 0 })
  transfersOutEvent: number;

  @Column({ name: 'dreamteam_count', default: 0 })
  dreamteamCount: number;

  @Column({ name: 'in_dreamteam', default: false })
  inDreamteam: boolean;

  @OneToMany(() => PlayerGameweekStat, (s) => s.player)
  gameweekStats: PlayerGameweekStat[];

  @OneToMany(() => OwnershipSnapshot, (o) => o.player)
  ownershipSnapshots: OwnershipSnapshot[];

  @OneToMany(() => PriceHistory, (ph) => ph.player)
  priceHistory: PriceHistory[];
}
