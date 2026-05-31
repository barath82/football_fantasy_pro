import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('api_sync_log')
export class ApiSyncLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  endpoint: string;

  @Column({ length: 20 })
  status: string;

  @Column({ name: 'records_processed', type: 'int', nullable: true })
  recordsProcessed: number | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs: number | null;

  @CreateDateColumn({ name: 'synced_at' })
  syncedAt: Date;
}
