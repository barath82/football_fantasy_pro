import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { Gameweek } from './gameweek.entity';
import { Fixture } from './fixture.entity';

@Entity('player_gameweek_stats')
@Index(['playerId', 'gameweekId', 'fixtureId'], { unique: true })
export class PlayerGameweekStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @ManyToOne(() => Player, (p) => p.gameweekStats)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'gameweek_id' })
  gameweekId: number;

  @ManyToOne(() => Gameweek, (gw) => gw.playerStats)
  @JoinColumn({ name: 'gameweek_id' })
  gameweek: Gameweek;

  @Column({ name: 'fixture_id', type: 'int', nullable: true })
  fixtureId: number | null;

  @ManyToOne(() => Fixture, (f) => f.playerStats, { nullable: true })
  @JoinColumn({ name: 'fixture_id' })
  fixture: Fixture;

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
  influence: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creativity: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  threat: number | null;

  @Column({ name: 'ict_index', type: 'decimal', precision: 10, scale: 2, nullable: true })
  ictIndex: number | null;

  @Column({ name: 'total_points', default: 0 })
  totalPoints: number;

  // Price at time of this gameweek (tenths of millions)
  @Column({ type: 'int', nullable: true })
  value: number | null;

  @Column({ name: 'transfers_balance', type: 'int', nullable: true })
  transfersBalance: number | null;

  @Column({ type: 'int', nullable: true })
  selected: number | null;

  @Column({ name: 'transfers_in', type: 'int', nullable: true })
  transfersIn: number | null;

  @Column({ name: 'transfers_out', type: 'int', nullable: true })
  transfersOut: number | null;

  @Column({ type: 'int', nullable: true })
  round: number | null;

  @Column({ name: 'was_home', type: 'boolean', nullable: true })
  wasHome: boolean | null;
}
