import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces';

/**
 * Parameter decorator to extract the authenticated User from the request
 * Use in controllers protected by AdminAuthGuard
 *
 * @example
 * @Get('profile')
 * @UseGuards(AdminAuthGuard)
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser;
  },
);
