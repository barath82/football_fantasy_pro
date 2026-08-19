import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Pick } from './pick.entity';

export type AuthProvider = 'google' | 'x';

/**
 * An authenticated FantasyBrahma account. Only ever created via a completed
 * OAuth callback (Google or X) — there's no anonymous/device-id user here,
 * per the "must be logged in to submit" decision (2026-08-19, supersedes the
 * earlier anonymous-device-id plan — see MEMORY.md).
 */
@Entity('users')
@Unique(['provider', 'providerId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  provider: AuthProvider;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  /** e.g. "@someuser" — only meaningful for X accounts; null for Google. */
  @Column({ type: 'varchar', nullable: true })
  handle: string | null;

  /** User-entered FPL Team ID — no "connect your team" flow yet, this is just stored for later. */
  @Column({ name: 'fpl_team_id', type: 'varchar', nullable: true })
  fplTeamId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Pick, (p) => p.user)
  picks: Pick[];
}
