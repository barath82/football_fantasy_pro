import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { randomBytes, createHash } from 'crypto';
import { User, AuthProvider } from '../../database/entities/user.entity';
import { SESSION_MAX_AGE_MS } from './auth.constants';

export interface OAuthProfile {
  providerId: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  handle: string | null;
}

export interface JwtPayload {
  sub: string; // user id
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Configuration state ──────────────────────────────────────────────────

  isConfigured(provider: AuthProvider): boolean {
    const creds = this.config.get(`auth.${provider}`);
    return !!(creds?.clientId && creds?.clientSecret);
  }

  // ─── PKCE / CSRF helpers ──────────────────────────────────────────────────

  generateState(): string {
    return randomBytes(16).toString('hex');
  }

  generatePkcePair(): { verifier: string; challenge: string } {
    const verifier = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  // ─── Authorize URLs ───────────────────────────────────────────────────────

  buildGoogleAuthUrl(state: string): string {
    const { clientId } = this.config.get('auth.google');
    const redirectUri = `${this.config.get('auth.apiUrl')}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  buildXAuthUrl(state: string, codeChallenge: string): string {
    const { clientId } = this.config.get('auth.x');
    const redirectUri = `${this.config.get('auth.apiUrl')}/api/auth/x/callback`;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'users.read tweet.read',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `https://x.com/i/oauth2/authorize?${params.toString()}`;
  }

  // ─── Code exchange ────────────────────────────────────────────────────────

  async exchangeGoogleCode(code: string): Promise<OAuthProfile> {
    const { clientId, clientSecret } = this.config.get('auth.google');
    const redirectUri = `${this.config.get('auth.apiUrl')}/api/auth/google/callback`;

    const { data: tokens } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const { data: profile } = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    return {
      providerId: profile.sub,
      displayName: profile.name ?? profile.email ?? 'Google user',
      email: profile.email ?? null,
      avatarUrl: profile.picture ?? null,
      handle: null,
    };
  }

  async exchangeXCode(code: string, codeVerifier: string): Promise<OAuthProfile> {
    const { clientId, clientSecret } = this.config.get('auth.x');
    const redirectUri = `${this.config.get('auth.apiUrl')}/api/auth/x/callback`;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const { data: tokens } = await axios.post(
      'https://api.x.com/2/oauth2/token',
      new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${basicAuth}` } },
    );

    const { data: profile } = await axios.get('https://api.x.com/2/users/me', {
      params: { 'user.fields': 'profile_image_url' },
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    return {
      providerId: profile.data.id,
      displayName: profile.data.name ?? profile.data.username ?? 'X user',
      email: null, // X's OAuth2 user endpoint doesn't return email without extra approval
      avatarUrl: profile.data.profile_image_url ?? null,
      handle: profile.data.username ? `@${profile.data.username}` : null,
    };
  }

  // ─── User + session ───────────────────────────────────────────────────────

  async findOrCreateUser(provider: AuthProvider, profile: OAuthProfile): Promise<User> {
    let user = await this.userRepo.findOneBy({ provider, providerId: profile.providerId });
    if (!user) {
      user = this.userRepo.create({
        provider,
        providerId: profile.providerId,
        displayName: profile.displayName,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        handle: profile.handle,
      });
      await this.userRepo.save(user);
      this.logger.log(`New user via ${provider}: ${profile.displayName}`);
    }
    return user;
  }

  issueToken(user: User): string {
    const payload: JwtPayload = { sub: user.id };
    return this.jwt.sign(payload, { secret: this.config.get('auth.jwtSecret'), expiresIn: SESSION_MAX_AGE_MS / 1000 });
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwt.verify<JwtPayload>(token, { secret: this.config.get('auth.jwtSecret') });
      return await this.userRepo.findOneBy({ id: payload.sub });
    } catch {
      return null;
    }
  }

  async updateFplTeamId(userId: string, fplTeamId: string): Promise<User> {
    await this.userRepo.update({ id: userId }, { fplTeamId });
    return this.userRepo.findOneByOrFail({ id: userId });
  }
}
