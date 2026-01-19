import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators';
import { AuthenticatedUser } from '../interfaces';

/**
 * Guard that checks if the authenticated user has the required role(s)
 * Must be used after AdminAuthGuard so that request.user is populated
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
 * @UseGuards(AdminAuthGuard, RolesGuard)
 * @Delete(':id')
 * deleteUser() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles specified, allow access (auth-only, no role restriction)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('Access denied. Insufficient permissions.');
    }

    return true;
  }
}
