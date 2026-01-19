import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Metadata key for required roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access an endpoint
 * Use with RolesGuard to enforce role-based access control
 * Roles are checked against user.role from the database
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
 * @UseGuards(AdminAuthGuard, RolesGuard)
 * @Delete(':id')
 * deleteUser(@Param('id') id: string) { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
