import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KeycloakRealmConfig {
  issuerUrl: string;
  audience: string;
  jwksUri: string;
}

@Injectable()
export class KeycloakConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get Admin SSO Keycloak configuration (BC Gov SSO - IDIR)
   */
  getAdminConfig(): KeycloakRealmConfig {
    const issuerUrl = this.configService.getOrThrow<string>(
      'ADMIN_KC_ISSUER_URL',
    );
    return {
      issuerUrl,
      audience: this.configService.getOrThrow<string>('ADMIN_KC_AUDIENCE'),
      jwksUri: this.buildJwksUri(issuerUrl),
    };
  }

  /**
   * Get Referral Keycloak configuration (BC Gov SSO - Entra IdP)
   */
  getReferralConfig(): KeycloakRealmConfig {
    const issuerUrl = this.configService.getOrThrow<string>(
      'REFERRAL_KC_ISSUER_URL',
    );
    return {
      issuerUrl,
      audience: this.configService.getOrThrow<string>('REFERRAL_KC_AUDIENCE'),
      jwksUri: this.buildJwksUri(issuerUrl),
    };
  }

  /**
   * Build JWKS URI from issuer URL
   * Both realms use standard BC Gov Keycloak endpoints
   */
  private buildJwksUri(issuerUrl: string): string {
    // Remove trailing slash if present
    const baseUrl = issuerUrl.replace(/\/$/, '');

    // Standard Keycloak JWKS endpoint
    return `${baseUrl}/protocol/openid-connect/certs`;
  }
}
