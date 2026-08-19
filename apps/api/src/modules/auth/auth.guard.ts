import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '../../database/entities/user.entity';

export interface AuthedRequest extends Request {
  user: User;
}

/** Guards routes that require a logged-in user — e.g. submitting picks. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.cookies?.['pw_session'] as string | undefined;
    const user = token ? await this.auth.verifyToken(token) : null;
    if (!user) throw new UnauthorizedException('Login required');
    req.user = user;
    return true;
  }
}
