import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Season } from './season.entity';
import { Player } from './player.entity';

@Entity('teams')
@Index(['fplId', 'seasonId'], { unique: true })
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fpl_id' })
  fplId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  @ManyToOne(() => Season, (s) => s.teams)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'short_name', length: 10 })
  shortName: string;

  @Column({ type: 'int', nullable: true })
  code: number | null;

  @Column({ name: 'strength_overall_home', type: 'int', nullable: true })
  strengthOverallHome: number | null;

  @Column({ name: 'strength_overall_away', type: 'int', nullable: true })
  strengthOverallAway: number | null;

  @Column({ name: 'strength_attack_home', type: 'int', nullable: true })
  strengthAttackHome: number | null;

  @Column({ name: 'strength_attack_away', type: 'int', nullable: true })
  strengthAttackAway: number | null;

  @Column({ name: 'strength_defence_home', type: 'int', nullable: true })
  strengthDefenceHome: number | null;

  @Column({ name: 'strength_defence_away', type: 'int', nullable: true })
  strengthDefenceAway: number | null;

  @OneToMany(() => Player, (p) => p.team)
  players: Player[];
}
