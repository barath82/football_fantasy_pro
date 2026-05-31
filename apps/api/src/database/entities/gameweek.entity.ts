import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Season } from './season.entity';
import { Fixture } from './fixture.entity';
import { PlayerGameweekStat } from './player-gameweek-stat.entity';
import { OwnershipSnapshot } from './ownership-snapshot.entity';
import { PriceHistory } from './price-history.entity';

@Entity('gameweeks')
@Index(['fplId', 'seasonId'], { unique: true })
export class Gameweek {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fpl_id' })
  fplId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  @ManyToOne(() => Season, (s) => s.gameweeks)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column({ length: 50 })
  name: string;

  @Column({ name: 'deadline_time', type: 'timestamp', nullable: true })
  deadlineTime: Date | null;

  @Column({ name: 'average_entry_score', type: 'int', nullable: true })
  averageEntryScore: number | null;

  @Column({ name: 'highest_score', type: 'int', nullable: true })
  highestScore: number | null;

  @Column({ name: 'highest_scoring_entry', type: 'int', nullable: true })
  highestScoringEntry: number | null;

  @Column({ default: false })
  finished: boolean;

  @Column({ name: 'data_checked', default: false })
  dataChecked: boolean;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @Column({ name: 'is_next', default: false })
  isNext: boolean;

  @Column({ name: 'is_previous', default: false })
  isPrevious: boolean;

  @Column({ name: 'chip_plays', type: 'jsonb', nullable: true })
  chipPlays: object;

  @Column({ name: 'most_selected', type: 'int', nullable: true })
  mostSelected: number | null;

  @Column({ name: 'most_transferred_in', type: 'int', nullable: true })
  mostTransferredIn: number | null;

  @Column({ name: 'top_element', type: 'int', nullable: true })
  topElement: number | null;

  @Column({ name: 'transfers_made', type: 'int', nullable: true })
  transfersMade: number | null;

  @OneToMany(() => Fixture, (f) => f.gameweek)
  fixtures: Fixture[];

  @OneToMany(() => PlayerGameweekStat, (s) => s.gameweek)
  playerStats: PlayerGameweekStat[];

  @OneToMany(() => OwnershipSnapshot, (o) => o.gameweek)
  ownershipSnapshots: OwnershipSnapshot[];

  @OneToMany(() => PriceHistory, (ph) => ph.gameweek)
  priceHistory: PriceHistory[];
}
