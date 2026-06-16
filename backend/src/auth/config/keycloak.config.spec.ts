import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KeycloakConfigService } from './keycloak.config';

describe('KeycloakConfigService', () => {
  let service: KeycloakConfigService;

  const configValues: Record<string, string> = {
    ADMIN_KC_ISSUER_URL: 'https://admin.example.com/realms/admin/',
    ADMIN_KC_AUDIENCE: 'admin',
    REFERRAL_KC_ISSUER_URL: 'https://referral.example.com/realms/referral',
    REFERRAL_KC_AUDIENCE: 'referral',
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const value = configValues[key];
      if (!value) {
        throw new Error(`Missing config: ${key}`);
      }
      return value;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<KeycloakConfigService>(KeycloakConfigService);
    jest.clearAllMocks();
  });

  describe('getAdminConfig', () => {
    it('should return admin realm configuration with normalized jwks uri', () => {
      const result = service.getAdminConfig();

      expect(result).toEqual({
        issuerUrl: 'https://admin.example.com/realms/admin/',
        audience: 'admin',
        jwksUri:
          'https://admin.example.com/realms/admin/protocol/openid-connect/certs',
      });
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(
        'ADMIN_KC_ISSUER_URL',
      );
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(
        'ADMIN_KC_AUDIENCE',
      );
    });
  });

  describe('getReferralConfig', () => {
    it('should return referral realm configuration with jwks uri', () => {
      const result = service.getReferralConfig();

      expect(result).toEqual({
        issuerUrl: 'https://referral.example.com/realms/referral',
        audience: 'referral',
        jwksUri:
          'https://referral.example.com/realms/referral/protocol/openid-connect/certs',
      });
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(
        'REFERRAL_KC_ISSUER_URL',
      );
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(
        'REFERRAL_KC_AUDIENCE',
      );
    });
  });

  describe('missing config handling', () => {
    it('should throw when required config value is missing', () => {
      mockConfigService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'ADMIN_KC_AUDIENCE') {
          throw new Error('Missing config: ADMIN_KC_AUDIENCE');
        }
        return configValues[key];
      });

      expect(() => service.getAdminConfig()).toThrow(
        'Missing config: ADMIN_KC_AUDIENCE',
      );
    });
  });
});