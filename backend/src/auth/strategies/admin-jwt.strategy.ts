import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { KeycloakConfigService } from '../config';
import { KeycloakTokenPayload, AuthenticatedUser } from '../interfaces';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JWT Strategy for Admin Realm (BC Gov SSO - IDIR)
 * Validates tokens issued by the admin Keycloak realm
 * Returns the User entity from the database
 */
@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly keycloakConfig: KeycloakConfigService,
    private readonly prisma: PrismaService,
  ) {
    const config = keycloakConfig.getAdminConfig();

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: config.audience,
      issuer: config.issuerUrl,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.jwksUri,
      }),
    });
  }

  /**
   * Validate the JWT payload and return the authenticated user
   * Called after token signature is verified
   */
  async validate(payload: KeycloakTokenPayload): Promise<AuthenticatedUser> {
    const keycloakId = payload.sub;
    const email = payload.email;

    // Try find by keycloakId first (already linked user)
    let user = await this.prisma.user.findUnique({
      where: { keycloakId },
    });

    // If not found by keycloakId, try by email and auto-link
    if (!user && email) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user && !user.keycloakId) {
        // Auto-link keycloakId on first login
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { keycloakId },
        });
      }
    }

    if (!user) {
      throw new UnauthorizedException(
        'User not found. Please contact an administrator.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated.');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('User account has been deleted.');
    }

    return user;
  }
}
