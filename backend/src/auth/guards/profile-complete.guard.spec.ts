import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ProfileCompleteGuard } from './profile-complete.guard';
import { AuthenticatedContact } from '../interfaces';

describe('ProfileCompleteGuard', () => {
  let guard: ProfileCompleteGuard;
  let reflector: Reflector;

  // Factory for creating mock execution context
  const createMockExecutionContext = (user: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

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

  // Factory for creating authenticated contact
  const createAuthenticatedContact = (
    isProfileComplete: boolean,
    contactOverrides = {},
  ): AuthenticatedContact => ({
    contact: createTestContact(contactOverrides),
    isProfileComplete,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileCompleteGuard, Reflector],
    }).compile();

    guard = module.get<ProfileCompleteGuard>(ProfileCompleteGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when profile is complete', () => {
      // Arrange
      const authContact = createAuthenticatedContact(true);
      const context = createMockExecutionContext(authContact);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when profile is incomplete', () => {
      // Arrange
      const authContact = createAuthenticatedContact(false, { phone: null });
      const context = createMockExecutionContext(authContact);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Profile setup required. Please complete your profile to continue.',
      );
    });

    it('should allow access to public routes regardless of profile status', () => {
      // Arrange
      const authContact = createAuthenticatedContact(false);
      const context = createMockExecutionContext(authContact);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // isPublic = true

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when no user is attached', () => {
      // Arrange
      const context = createMockExecutionContext(undefined);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Authentication required.',
      );
    });

    it('should allow access to public routes even without user', () => {
      // Arrange
      const context = createMockExecutionContext(undefined);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // isPublic = true

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });
  });
});
