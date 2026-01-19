import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators';

/**
 * Guard that accepts EITHER admin-jwt OR contact-jwt tokens
 * Use for shared lookup endpoints that both admin and referral users need
 *
 * Tries admin-jwt first, then falls back to contact-jwt
 * Sets request.user to either AuthenticatedUser or AuthenticatedContact
 */
@Injectable()
export class EitherAuthGuard implements CanActivate {
  private readonly adminGuard: CanActivate;
  private readonly contactGuard: CanActivate;

  constructor(private readonly reflector: Reflector) {
    // Create instances of both auth guards
    this.adminGuard = new (AuthGuard('admin-jwt'))();
    this.contactGuard = new (AuthGuard('contact-jwt'))();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Try admin-jwt first
    try {
      const adminResult = await this.tryGuard(this.adminGuard, context);
      if (adminResult) {
        return true;
      }
    } catch {
      // Admin auth failed, try contact-jwt
    }

    // Try contact-jwt
    try {
      const contactResult = await this.tryGuard(this.contactGuard, context);
      if (contactResult) {
        return true;
      }
    } catch {
      // Contact auth also failed
    }

    throw new UnauthorizedException('Invalid or missing authentication token.');
  }

  private async tryGuard(
    guard: CanActivate,
    context: ExecutionContext,
  ): Promise<boolean> {
    // AuthGuard.canActivate can return boolean or Observable<boolean>
    const result = guard.canActivate(context);

    if (result instanceof Promise) {
      return await result;
    }

    // Handle Observable case (shouldn't happen with passport but be safe)
    if (typeof result === 'boolean') {
      return result;
    }

    // Observable - convert to promise
    return new Promise((resolve, reject) => {
      (result as any).subscribe({
        next: (val: boolean) => resolve(val),
        error: (err: Error) => reject(err),
      });
    });
  }
}
