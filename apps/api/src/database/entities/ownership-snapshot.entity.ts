import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { Gameweek } from './gameweek.entity';

@Entity('ownership_snapshots')
@Index(['playerId', 'gameweekId'], { unique: true })
export class OwnershipSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @ManyToOne(() => Player, (p) => p.ownershipSnapshots)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'gameweek_id' })
  gameweekId: number;

  @ManyToOne(() => Gameweek, (gw) => gw.ownershipSnapshots)
  @JoinColumn({ name: 'gameweek_id' })
  gameweek: Gameweek;

  @Column({ name: 'selected_by_percent', type: 'decimal', precision: 6, scale: 2, nullable: true })
  selectedByPercent: number | null;

  @Column({ name: 'transfers_in', type: 'int', nullable: true })
  transfersIn: number | null;

  @Column({ name: 'transfers_out', type: 'int', nullable: true })
  transfersOut: number | null;
}
