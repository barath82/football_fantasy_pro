import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Thin wrapper around Resend so the rest of the app never touches the SDK
 * directly. Same "not configured" pattern as Google/X — if RESEND_API_KEY
 * is unset, we log instead of throwing, so local dev doesn't need a real
 * account to work on the rest of the app.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string | null>('email.resendApiKey');
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`RESEND_API_KEY not set — skipping password reset email to ${to}. Link: ${resetUrl}`);
      return;
    }

    const from = this.config.get<string>('email.from') ?? 'FantasyBrahma <onboarding@resend.dev>';
    const { error } = await this.client.emails.send({
      from,
      to,
      subject: 'Reset your FantasyBrahma password',
      html: `
        <p>Someone requested a password reset for your FantasyBrahma account.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 60 minutes. If you didn't request this, you can ignore this email.</p>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
      throw new Error('Failed to send password reset email');
    }

    this.logger.log(`Password reset email sent to ${to}`);
  }
}
