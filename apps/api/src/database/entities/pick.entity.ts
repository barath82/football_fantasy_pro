import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Gameweek } from './gameweek.entity';
import { Player } from './player.entity';

/**
 * One user's six weekly picks for one gameweek. All four player fields
 * (transfer-in/out, both differentials) are real players from our synced FPL
 * list — search covers the whole player pool for all of them. Transfer-out
 * and captain used to be limited to a hardcoded fictional 11-man squad
 * (predictor/mock/presetSquad.ts) since there was no "connect your real FPL
 * team" flow; opened up to full search in the meantime (2026-08-19) rather
 * than leave picks pointing at players who may not even be real anymore —
 * see MEMORY.md. Swap for the user's actual squad once that flow exists.
 */
@Entity('picks')
@Unique(['userId', 'gameweekId'])
export class Pick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'gameweek_id' })
  gameweekId: number;

  @ManyToOne(() => Gameweek)
  @JoinColumn({ name: 'gameweek_id' })
  gameweek: Gameweek;

  @Column({ name: 'transfer_in_player_id', type: 'int', nullable: true })
  transferInPlayerId: number | null;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'transfer_in_player_id' })
  transferInPlayer: Player | null;

  @Column({ name: 'transfer_out_player_id', type: 'int', nullable: true })
  transferOutPlayerId: number | null;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'transfer_out_player_id' })
  transferOutPlayer: Player | null;

  @Column({ name: 'differential_succeed_player_id', type: 'int', nullable: true })
  differentialSucceedPlayerId: number | null;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'differential_succeed_player_id' })
  differentialSucceedPlayer: Player | null;

  @Column({ name: 'differential_blank_player_id', type: 'int', nullable: true })
  differentialBlankPlayerId: number | null;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'differential_blank_player_id' })
  differentialBlankPlayer: Player | null;

  @Column({ type: 'varchar', nullable: true })
  formation: string | null;

  @Column({ name: 'captain_player_id', type: 'int', nullable: true })
  captainPlayerId: number | null;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'captain_player_id' })
  captainPlayer: Player | null;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;
}
