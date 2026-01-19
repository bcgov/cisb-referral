import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { KeycloakConfigService } from '../config';
import { KeycloakTokenPayload, AuthenticatedContact } from '../interfaces';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JWT Strategy for Referral Realm (BC Gov SSO - Entra IdP)
 * Validates tokens issued by the referral Keycloak realm
 * Returns the Contact entity from the database (creates if not exists)
 */
@Injectable()
export class ContactJwtStrategy extends PassportStrategy(
  Strategy,
  'contact-jwt',
) {
  constructor(
    private readonly keycloakConfig: KeycloakConfigService,
    private readonly prisma: PrismaService,
  ) {
    const config = keycloakConfig.getReferralConfig();

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
   * Validate the JWT payload and return the authenticated contact
   * Called after token signature is verified
   * Auto-creates Contact on first login
   */
  async validate(payload: KeycloakTokenPayload): Promise<AuthenticatedContact> {
    const keycloakId = payload.sub;

    // Find or create contact by Keycloak ID
    let contact = await this.prisma.contact.findUnique({
      where: { keycloakId },
    });

    if (!contact) {
      // Auto-create contact on first login with data from token
      contact = await this.prisma.contact.create({
        data: {
          keycloakId,
          email: payload.email || '',
          fullName: payload.name || payload.preferred_username || '',
          userName: payload.preferred_username || payload.email || keycloakId,
          isActive: true,
        },
      });
    }

    if (!contact.isActive) {
      // Contact exists but is deactivated
      throw new Error('Contact account is deactivated.');
    }

    // Determine if profile is complete (has required fields filled)
    const isProfileComplete = this.checkProfileComplete(contact);

    return {
      contact,
      isProfileComplete,
    };
  }

  /**
   * Check if the contact has completed their profile setup
   * Required fields: fullName, email, phone
   * fullName and email come from Keycloak, phone must be filled by user
   */
  private checkProfileComplete(contact: {
    fullName: string;
    email: string;
    phone: string | null;
  }): boolean {
    return Boolean(contact.fullName && contact.email && contact.phone);
  }
}
