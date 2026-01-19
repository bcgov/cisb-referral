import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { KeycloakConfigService } from './config';
import { AdminJwtStrategy, ContactJwtStrategy } from './strategies';
import { EitherAuthGuard } from './guards';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Authentication Module
 *
 * Configures global authentication defaults:
 * - EitherAuthGuard is applied globally (accepts admin-jwt OR contact-jwt)
 * - Use @Public() decorator to opt-out for public endpoints (e.g., health)
 * - Use @UseGuards(AdminAuthGuard, RolesGuard) to require admin-only access
 *
 * This ensures secure-by-default: no endpoint is accidentally left unprotected.
 */
@Module({
  imports: [PassportModule, PrismaModule],
  providers: [
    KeycloakConfigService,
    AdminJwtStrategy,
    ContactJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: EitherAuthGuard,
    },
  ],
  exports: [KeycloakConfigService],
})
export class AuthModule {}
