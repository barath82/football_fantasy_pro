import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  name: process.env.DB_NAME ?? 'fantasy_db',
  username: process.env.DB_USER ?? 'fantasy_user',
  password: process.env.DB_PASSWORD ?? 'fantasy_pass',
}));
