import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators';

/**
 * Auth guard for referral-realm (BC Gov SSO - Entra IdP)
 * Uses the 'contact-jwt' strategy to validate tokens
 * Respects @Public() decorator to skip auth on health checks
 */
@Injectable()
export class ContactAuthGuard extends AuthGuard('contact-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Otherwise, run the JWT validation
    return super.canActivate(context);
  }
}
