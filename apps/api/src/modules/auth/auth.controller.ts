import { Body, Controller, Get, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, MaxLength } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import type { AuthedRequest } from './auth.guard';
import { SESSION_MAX_AGE_MS } from './auth.constants';

class UpdateFplTeamIdDto {
  @IsString()
  @MaxLength(20)
  fplTeamId: string;
}

const SESSION_COOKIE = 'pw_session';
const STATE_COOKIE = 'pw_oauth_state';
const RETURN_TO_COOKIE = 'pw_oauth_return_to';
const PKCE_COOKIE = 'pw_pkce_verifier';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieOpts(maxAgeMs?: number) {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.config.get('app.nodeEnv') === 'production',
      path: '/',
      ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
    };
  }

  private frontendUrl(path: string): string {
    return `${this.config.get('auth.frontendUrl')}${path}`;
  }

  // ─── Google ───────────────────────────────────────────────────────────────

  @Get('google')
  googleStart(@Query('returnTo') returnTo: string | undefined, @Res() res: Response) {
    if (!this.auth.isConfigured('google')) {
      return res.redirect(this.frontendUrl('/signup?error=google_not_configured'));
    }
    const state = this.auth.generateState();
    res.cookie(STATE_COOKIE, state, this.cookieOpts(5 * 60 * 1000));
    res.cookie(RETURN_TO_COOKIE, returnTo ?? '/challenges', this.cookieOpts(5 * 60 * 1000));
    return res.redirect(this.auth.buildGoogleAuthUrl(state));
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const returnTo = (req.cookies?.[RETURN_TO_COOKIE] as string | undefined) ?? '/challenges';
    if (!code || !state || state !== req.cookies?.[STATE_COOKIE]) {
      return res.redirect(this.frontendUrl(`/signup?error=state_mismatch&returnTo=${encodeURIComponent(returnTo)}`));
    }
    try {
      const profile = await this.auth.exchangeGoogleCode(code);
      const user = await this.auth.findOrCreateUser('google', profile);
      const token = this.auth.issueToken(user);
      res.cookie(SESSION_COOKIE, token, this.cookieOpts(SESSION_MAX_AGE_MS));
      res.clearCookie(STATE_COOKIE);
      res.clearCookie(RETURN_TO_COOKIE);
      return res.redirect(this.frontendUrl(returnTo));
    } catch (err: any) {
      return res.redirect(this.frontendUrl(`/signup?error=google_failed&returnTo=${encodeURIComponent(returnTo)}`));
    }
  }

  // ─── X ─────────────────────────────────────────────────────────────────────

  @Get('x')
  xStart(@Query('returnTo') returnTo: string | undefined, @Res() res: Response) {
    if (!this.auth.isConfigured('x')) {
      return res.redirect(this.frontendUrl('/signup?error=x_not_configured'));
    }
    const state = this.auth.generateState();
    const { verifier, challenge } = this.auth.generatePkcePair();
    res.cookie(STATE_COOKIE, state, this.cookieOpts(5 * 60 * 1000));
    res.cookie(PKCE_COOKIE, verifier, this.cookieOpts(5 * 60 * 1000));
    res.cookie(RETURN_TO_COOKIE, returnTo ?? '/challenges', this.cookieOpts(5 * 60 * 1000));
    return res.redirect(this.auth.buildXAuthUrl(state, challenge));
  }

  @Get('x/callback')
  async xCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const returnTo = (req.cookies?.[RETURN_TO_COOKIE] as string | undefined) ?? '/challenges';
    const verifier = req.cookies?.[PKCE_COOKIE] as string | undefined;
    if (!code || !state || !verifier || state !== req.cookies?.[STATE_COOKIE]) {
      return res.redirect(this.frontendUrl(`/signup?error=state_mismatch&returnTo=${encodeURIComponent(returnTo)}`));
    }
    try {
      const profile = await this.auth.exchangeXCode(code, verifier);
      const user = await this.auth.findOrCreateUser('x', profile);
      const token = this.auth.issueToken(user);
      res.cookie(SESSION_COOKIE, token, this.cookieOpts(SESSION_MAX_AGE_MS));
      res.clearCookie(STATE_COOKIE);
      res.clearCookie(PKCE_COOKIE);
      res.clearCookie(RETURN_TO_COOKIE);
      return res.redirect(this.frontendUrl(returnTo));
    } catch (err: any) {
      return res.redirect(this.frontendUrl(`/signup?error=x_failed&returnTo=${encodeURIComponent(returnTo)}`));
    }
  }

  // ─── Session ──────────────────────────────────────────────────────────────

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const user = token ? await this.auth.verifyToken(token) : null;
    if (!user) return { authenticated: false };
    return {
      authenticated: true,
      user: {
        id: user.id,
        provider: user.provider,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        email: user.email,
        handle: user.handle,
        fplTeamId: user.fplTeamId,
      },
    };
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@Req() req: AuthedRequest, @Body() dto: UpdateFplTeamIdDto) {
    const user = await this.auth.updateFplTeamId(req.user.id, dto.fplTeamId);
    return {
      id: user.id,
      provider: user.provider,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      email: user.email,
      handle: user.handle,
      fplTeamId: user.fplTeamId,
    };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie(SESSION_COOKIE, this.cookieOpts());
    return res.json({ ok: true });
  }
}
