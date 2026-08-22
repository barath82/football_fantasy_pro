import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { User, AuthProvider } from '../../database/entities/user.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { EmailService } from '../email/email.service';
import { SESSION_MAX_AGE_MS } from './auth.constants';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes

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
    @InjectRepository(PasswordResetToken) private readonly resetTokenRepo: Repository<PasswordResetToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
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

  // ─── Email/password ───────────────────────────────────────────────────────

  async registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
    // Check across ALL providers, not just 'email' — someone who signed up via
    // Google/X with this same email shouldn't be able to create a second,
    // separate account with a password on top of it.
    const existing = await this.userRepo.findOneBy({ email });
    if (existing) {
      if (existing.provider === 'email') {
        throw new ConflictException('An account with that email already exists.');
      }
      const providerLabel = existing.provider === 'google' ? 'Google' : 'X';
      throw new ConflictException(
        `An account with that email already exists — signed up with ${providerLabel}. Log in with ${providerLabel} instead.`,
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = this.userRepo.create({
      provider: 'email',
      providerId: email, // no external provider id for email accounts — the email itself is the identifier
      displayName,
      email,
      avatarUrl: null,
      handle: null,
      passwordHash,
    });
    await this.userRepo.save(user);
    this.logger.log(`New user via email: ${displayName}`);
    return user;
  }

  async loginWithEmail(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ provider: 'email', providerId: email });
    // Same generic error whether the email doesn't exist or the password is wrong —
    // distinguishing the two lets an attacker enumerate registered emails.
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    return user;
  }

  /** Always resolves without revealing whether the email is registered — same reasoning as loginWithEmail. */
  async requestPasswordReset(email: string, resetUrlBase: string): Promise<void> {
    const user = await this.userRepo.findOneBy({ provider: 'email', providerId: email });
    if (!user) return;

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await this.resetTokenRepo.save(
      this.resetTokenRepo.create({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        usedAt: null,
      }),
    );

    await this.email.sendPasswordReset(email, `${resetUrlBase}?token=${rawToken}`);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const candidate = await this.resetTokenRepo.findOneBy({ tokenHash, usedAt: IsNull() });
    if (!candidate || candidate.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This reset link is invalid or has expired.');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.userRepo.update({ id: candidate.userId }, { passwordHash });
    await this.resetTokenRepo.update({ id: candidate.id }, { usedAt: new Date() });
  }

  // ─── User + session ───────────────────────────────────────────────────────

  async findOrCreateUser(provider: AuthProvider, profile: OAuthProfile): Promise<{ user: User; isNew: boolean }> {
    let user = await this.userRepo.findOneBy({ provider, providerId: profile.providerId });
    let isNew = false;
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
      isNew = true;
    }
    return { user, isNew };
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
