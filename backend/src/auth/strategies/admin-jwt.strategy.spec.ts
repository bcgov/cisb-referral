import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { KeycloakConfigService } from '../config';
import { PrismaService } from '../../prisma/prisma.service';
import { KeycloakTokenPayload } from '../interfaces';
import { UserRole } from '../../generated/prisma/client';

describe('AdminJwtStrategy', () => {
  let strategy: AdminJwtStrategy;
  let prismaService: PrismaService;

  // Factory for creating test users
  const createTestUser = (overrides = {}) => ({
    id: 'user-uuid-123',
    keycloakId: 'kc-admin-123',
    email: 'admin@example.com',
    displayName: 'Test Admin',
    userName: 'testadmin',
    role: UserRole.ADMIN,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  // Factory for creating test token payloads
  const createTestPayload = (overrides = {}): KeycloakTokenPayload => ({
    sub: 'kc-admin-123',
    email: 'admin@example.com',
    name: 'Test Admin',
    preferred_username: 'testadmin',
    jti: 'test-token-id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: 'https://test-issuer.com',
    aud: 'test-client',
    ...overrides,
  });

  const mockKeycloakConfig = {
    getAdminConfig: jest.fn().mockReturnValue({
      issuerUrl: 'https://test-issuer.com',
      audience: 'test-client',
      jwksUri: 'https://test-issuer.com/.well-known/jwks.json',
    }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminJwtStrategy,
        { provide: KeycloakConfigService, useValue: mockKeycloakConfig },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    strategy = module.get<AdminJwtStrategy>(AdminJwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when valid and active', async () => {
      // Arrange
      const testUser = createTestUser();
      const payload = createTestPayload();
      mockPrismaService.user.findUnique.mockResolvedValue(testUser);

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual(testUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { keycloakId: payload.sub },
      });
    });

    it('should throw ForbiddenException when user not found', async () => {
      // Arrange
      const payload = createTestPayload({ sub: 'unknown-kc-id' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found. Please contact an administrator.',
      );
    });

    it('should throw ForbiddenException when user is inactive', async () => {
      // Arrange
      const inactiveUser = createTestUser({ isActive: false });
      const payload = createTestPayload();
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User account is deactivated.',
      );
    });

    it('should throw ForbiddenException when user is deleted', async () => {
      // Arrange
      const deletedUser = createTestUser({ deletedAt: new Date() });
      const payload = createTestPayload();
      mockPrismaService.user.findUnique.mockResolvedValue(deletedUser);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User account has been deleted.',
      );
    });
  });
});
