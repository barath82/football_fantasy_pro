import { Controller, Get, Post, Query } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('run')
  triggerSync(@Query('scope') scope?: 'bootstrap' | 'full') {
    // Fire and forget — returns immediately, sync runs in background
    const run = scope === 'bootstrap' ? this.syncService.runBootstrapSync() : this.syncService.runFullSync();
    run.catch((err) => console.error('Background sync failed:', err.message));
    return { message: `Sync started (${scope === 'bootstrap' ? 'bootstrap' : 'full'})`, timestamp: new Date().toISOString() };
  }

  @Get('logs')
  getLogs(@Query('limit') limit?: string) {
    return this.syncService.getRecentLogs(limit ? parseInt(limit, 10) : 20);
  }
}
