import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';
import { AuthenticatedContact } from '../interfaces';

/**
 * Guard that ensures a contact has completed their profile setup
 * Must be used AFTER ContactAuthGuard in the guard chain
 *
 * Required profile fields: fullName, email, phone
 * Returns 403 if profile is incomplete
 */
@Injectable()
export class ProfileCompleteGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedContact | undefined;

    if (!user) {
      // No user attached - ContactAuthGuard should have run first
      throw new ForbiddenException('Authentication required.');
    }

    if (!user.isProfileComplete) {
      throw new ForbiddenException(
        'Profile setup required. Please complete your profile to continue.',
      );
    }

    return true;
  }
}
