import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
  frontendUrl: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? `http://localhost:${process.env.PORT ?? '3001'}`,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? null,
  },
  x: {
    clientId: process.env.X_CLIENT_ID ?? null,
    clientSecret: process.env.X_CLIENT_SECRET ?? null,
  },
}));
