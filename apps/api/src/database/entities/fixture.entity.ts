import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Season } from './season.entity';
import { Gameweek } from './gameweek.entity';
import { Team } from './team.entity';
import { PlayerGameweekStat } from './player-gameweek-stat.entity';

@Entity('fixtures')
export class Fixture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fpl_id', unique: true })
  fplId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  @ManyToOne(() => Season, (s) => s.fixtures)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column({ name: 'gameweek_id', type: 'int', nullable: true })
  gameweekId: number | null;

  @ManyToOne(() => Gameweek, (gw) => gw.fixtures, { nullable: true })
  @JoinColumn({ name: 'gameweek_id' })
  gameweek: Gameweek;

  @Column({ name: 'team_h_id' })
  teamHId: number;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_h_id' })
  teamH: Team;

  @Column({ name: 'team_a_id' })
  teamAId: number;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_a_id' })
  teamA: Team;

  @Column({ name: 'team_h_score', type: 'int', nullable: true })
  teamHScore: number | null;

  @Column({ name: 'team_a_score', type: 'int', nullable: true })
  teamAScore: number | null;

  @Column({ name: 'kickoff_time', type: 'timestamp', nullable: true })
  kickoffTime: Date | null;

  @Column({ default: false })
  finished: boolean;

  @Column({ name: 'finished_provisional', default: false })
  finishedProvisional: boolean;

  @Column({ type: 'boolean', nullable: true })
  started: boolean | null;

  @Column({ name: 'team_h_difficulty', type: 'int', nullable: true })
  teamHDifficulty: number | null;

  @Column({ name: 'team_a_difficulty', type: 'int', nullable: true })
  teamADifficulty: number | null;

  @Column({ name: 'pulse_id', type: 'int', nullable: true })
  pulseId: number | null;

  @OneToMany(() => PlayerGameweekStat, (s) => s.fixture)
  playerStats: PlayerGameweekStat[];
}
