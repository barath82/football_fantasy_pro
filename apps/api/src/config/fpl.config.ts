import { registerAs } from '@nestjs/config';

export default registerAs('fpl', () => ({
  baseUrl: process.env.FPL_BASE_URL ?? 'https://fantasy.premierleague.com/api',
  cacheTtlSeconds: parseInt(process.env.FPL_CACHE_TTL_SECONDS ?? '300', 10),
  syncCron: process.env.FPL_SYNC_CRON ?? '0 */6 * * *',
  currentSeason: process.env.FPL_CURRENT_SEASON ?? '2025-26',
}));
