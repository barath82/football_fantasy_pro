import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { Gameweek } from './gameweek.entity';

@Entity('price_history')
@Index(['playerId', 'gameweekId'], { unique: true })
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @ManyToOne(() => Player, (p) => p.priceHistory)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'gameweek_id' })
  gameweekId: number;

  @ManyToOne(() => Gameweek, (gw) => gw.priceHistory)
  @JoinColumn({ name: 'gameweek_id' })
  gameweek: Gameweek;

  // Price in tenths of millions (e.g. 65 = £6.5m)
  @Column({ type: 'int', nullable: true })
  price: number | null;
}
