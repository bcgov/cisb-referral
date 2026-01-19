import { Test, TestingModule } from '@nestjs/testing';
import { ContactJwtStrategy } from './contact-jwt.strategy';
import { KeycloakConfigService } from '../config';
import { PrismaService } from '../../prisma/prisma.service';
import { KeycloakTokenPayload } from '../interfaces';

describe('ContactJwtStrategy', () => {
  let strategy: ContactJwtStrategy;
  let prismaService: PrismaService;

  // Factory for creating test contacts
  const createTestContact = (overrides = {}) => ({
    id: 'contact-uuid-123',
    keycloakId: 'kc-contact-123',
    email: 'contact@example.com',
    fullName: 'Test Contact',
    userName: 'testcontact',
    phone: '250-555-1234',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  // Factory for creating test token payloads
  const createTestPayload = (overrides = {}): KeycloakTokenPayload => ({
    sub: 'kc-contact-123',
    email: 'contact@example.com',
    name: 'Test Contact',
    preferred_username: 'testcontact',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: 'https://test-referral-issuer.com',
    aud: 'referral-client',
    ...overrides,
  });

  const mockKeycloakConfig = {
    getReferralConfig: jest.fn().mockReturnValue({
      issuerUrl: 'https://test-referral-issuer.com',
      audience: 'referral-client',
      jwksUri: 'https://test-referral-issuer.com/.well-known/jwks.json',
    }),
  };

  const mockPrismaService = {
    contact: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactJwtStrategy,
        { provide: KeycloakConfigService, useValue: mockKeycloakConfig },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    strategy = module.get<ContactJwtStrategy>(ContactJwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return existing contact with profile complete status', async () => {
      // Arrange
      const testContact = createTestContact();
      const payload = createTestPayload();
      mockPrismaService.contact.findUnique.mockResolvedValue(testContact);

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        contact: testContact,
        isProfileComplete: true,
      });
      expect(prismaService.contact.findUnique).toHaveBeenCalledWith({
        where: { keycloakId: payload.sub },
      });
    });

    it('should auto-create contact on first login', async () => {
      // Arrange
      const payload = createTestPayload({
        sub: 'new-kc-id',
        email: 'newuser@example.com',
        name: 'New User',
        preferred_username: 'newuser',
      });
      const createdContact = createTestContact({
        keycloakId: 'new-kc-id',
        email: 'newuser@example.com',
        fullName: 'New User',
        userName: 'newuser',
        phone: null,
      });

      mockPrismaService.contact.findUnique.mockResolvedValue(null);
      mockPrismaService.contact.create.mockResolvedValue(createdContact);

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(prismaService.contact.create).toHaveBeenCalledWith({
        data: {
          keycloakId: 'new-kc-id',
          email: 'newuser@example.com',
          fullName: 'New User',
          userName: 'newuser',
          isActive: true,
        },
      });
      expect(result.contact).toEqual(createdContact);
      expect(result.isProfileComplete).toBe(false); // No phone yet
    });

    it('should return isProfileComplete=false when phone is missing', async () => {
      // Arrange
      const contactWithoutPhone = createTestContact({ phone: null });
      const payload = createTestPayload();
      mockPrismaService.contact.findUnique.mockResolvedValue(
        contactWithoutPhone,
      );

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result.isProfileComplete).toBe(false);
    });

    it('should return isProfileComplete=false when email is empty', async () => {
      // Arrange
      const contactWithoutEmail = createTestContact({ email: '' });
      const payload = createTestPayload();
      mockPrismaService.contact.findUnique.mockResolvedValue(
        contactWithoutEmail,
      );

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result.isProfileComplete).toBe(false);
    });

    it('should return isProfileComplete=false when fullName is empty', async () => {
      // Arrange
      const contactWithoutName = createTestContact({ fullName: '' });
      const payload = createTestPayload();
      mockPrismaService.contact.findUnique.mockResolvedValue(
        contactWithoutName,
      );

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result.isProfileComplete).toBe(false);
    });

    it('should throw error when contact is deactivated', async () => {
      // Arrange
      const inactiveContact = createTestContact({ isActive: false });
      const payload = createTestPayload();
      mockPrismaService.contact.findUnique.mockResolvedValue(inactiveContact);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Contact account is deactivated.',
      );
    });

    it('should use preferred_username when name is missing', async () => {
      // Arrange
      const payload = createTestPayload({
        sub: 'new-kc-id',
        name: undefined,
        preferred_username: 'fallback_username',
      });
      const createdContact = createTestContact({
        keycloakId: 'new-kc-id',
        fullName: 'fallback_username',
      });

      mockPrismaService.contact.findUnique.mockResolvedValue(null);
      mockPrismaService.contact.create.mockResolvedValue(createdContact);

      // Act
      await strategy.validate(payload);

      // Assert
      expect(prismaService.contact.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fullName: 'fallback_username',
          }),
        }),
      );
    });
  });
});
