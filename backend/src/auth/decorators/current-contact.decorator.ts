import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedContact } from '../interfaces';

/**
 * Parameter decorator to extract the authenticated Contact from the request
 * Use in controllers protected by ContactAuthGuard
 *
 * @example
 * @Post('referrals')
 * @UseGuards(ContactAuthGuard)
 * createReferral(
 *   @CurrentContact() auth: AuthenticatedContact,
 *   @Body() dto: CreateReferralDto
 * ) {
 *   // auth.contact is the Contact entity
 *   // auth.isProfileComplete indicates if profile is complete
 * }
 */
export const CurrentContact = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedContact => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedContact;
  },
);
