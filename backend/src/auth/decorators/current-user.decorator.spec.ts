import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { CurrentContact } from './current-contact.decorator';

// Mocking createParamDecorator to return the inner factory directly avoids
// relying on Reflect metadata internals or @nestjs/common/constants private paths.
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: (factory: (data: unknown, ctx: unknown) => unknown) =>
    factory,
}));

type DecoratorFactory = (data: unknown, ctx: ExecutionContext) => unknown;

const createMockContext = (user: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as ExecutionContext;

describe('Auth decorators', () => {
  describe('CurrentUser', () => {
    it('should extract user from request', () => {
      const requestUser = { id: 'user-1', email: 'user@test.com' };

      const result = (CurrentUser as unknown as DecoratorFactory)(
        undefined,
        createMockContext(requestUser),
      );

      expect(result).toBe(requestUser);
    });

    it('should return undefined when request user is missing', () => {
      const result = (CurrentUser as unknown as DecoratorFactory)(
        undefined,
        createMockContext(undefined),
      );

      expect(result).toBeUndefined();
    });
  });

  describe('CurrentContact', () => {
    it('should extract contact auth payload from request', () => {
      const requestContact = {
        contact: {
          id: 'contact-1',
          fullName: 'Contact Name',
          email: 'contact@test.com',
        },
        isProfileComplete: true,
      };

      const result = (CurrentContact as unknown as DecoratorFactory)(
        undefined,
        createMockContext(requestContact),
      );

      expect(result).toBe(requestContact);
    });
  });
});
