import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';
import { Gameweek } from './gameweek.entity';
import { Fixture } from './fixture.entity';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 9, unique: true })
  year: string; // e.g. "2025-26"

  @Column({ name: 'fpl_season_id', nullable: true })
  fplSeasonId: number;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Team, (team) => team.season)
  teams: Team[];

  @OneToMany(() => Player, (player) => player.season)
  players: Player[];

  @OneToMany(() => Gameweek, (gw) => gw.season)
  gameweeks: Gameweek[];

  @OneToMany(() => Fixture, (f) => f.season)
  fixtures: Fixture[];
}
