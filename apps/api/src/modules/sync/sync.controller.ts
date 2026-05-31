import { Controller, Get, Post, Query } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('run')
  triggerSync() {
    // Fire and forget — returns immediately, sync runs in background
    this.syncService.runFullSync().catch((err) =>
      console.error('Background sync failed:', err.message),
    );
    return { message: 'Sync started', timestamp: new Date().toISOString() };
  }

  @Get('logs')
  getLogs(@Query('limit') limit?: string) {
    return this.syncService.getRecentLogs(limit ? parseInt(limit, 10) : 20);
  }
}
