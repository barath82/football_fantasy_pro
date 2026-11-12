import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { SyncService } from './sync.service';

/**
 * Keeps gameweek deadline/finished data fresh automatically — without this,
 * nothing ever updates "is GW N finished yet" or its deadline unless
 * someone remembers to hit /sync/run by hand. Several downstream features
 * depend on this staying current:
 *  - "latest completed gameweek" (My FPL Data, the homepage card) would
 *    otherwise stay frozen on whatever was last manually synced.
 *  - The ownership-snapshot cron (ownership-snapshot-cron.service.ts) reads
 *    Gameweek.deadlineTime to decide when it's "near a deadline" — stale
 *    deadlines mean that capture window is calculated against the wrong
 *    dates and may never trigger correctly.
 *
 * Schedule comes from FPL_SYNC_CRON (config/fpl.config.ts), an env var that
 * has existed since the start of this project but was never actually wired
 * to anything until now — registered dynamically via SchedulerRegistry
 * rather than the @Cron decorator, since the decorator needs a literal
 * expression at class-definition time and can't read ConfigService.
 */
@Injectable()
export class BootstrapSyncCronService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapSyncCronService.name);

  constructor(
    private readonly syncService: SyncService,
    private readonly config: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const cronExpression = this.config.get<string>('fpl.syncCron') ?? '0 */6 * * *';
    const job = new CronJob(cronExpression, () => this.runSync());
    this.schedulerRegistry.addCronJob('fpl-bootstrap-sync', job as any);
    job.start();
    this.logger.log(`Scheduled FPL bootstrap sync: "${cronExpression}"`);
  }

  private async runSync(): Promise<void> {
    try {
      await this.syncService.runBootstrapSync();
    } catch (err: any) {
      this.logger.error(`Scheduled bootstrap sync failed: ${err.message}`);
    }
  }
}
