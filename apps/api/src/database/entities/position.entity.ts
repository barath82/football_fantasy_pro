import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fpl_id', unique: true })
  fplId: number;

  @Column({ name: 'singular_name', length: 50 })
  singularName: string;

  @Column({ name: 'singular_name_short', length: 5 })
  singularNameShort: string; // GKP, DEF, MID, FWD

  @Column({ name: 'plural_name', length: 50 })
  pluralName: string;

  @OneToMany(() => Player, (p) => p.position)
  players: Player[];
}
