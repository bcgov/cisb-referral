import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { CurrentContact } from './current-contact.decorator';
import { CurrentUser } from './current-user.decorator';

const getParamDecoratorFactory = (
  decorator: (...args: any[]) => ParameterDecorator,
) => {
  class TestClass {
    public testMethod(
      @decorator() // eslint-disable-line @typescript-eslint/no-unused-vars
      _value: unknown,
    ): void {
      // Method body intentionally unused; only metadata is required for the test.
    }
  }

  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestClass,
    'testMethod',
  );
  const key = Object.keys(metadata)[0];

  return metadata[key].factory as (
    data: unknown,
    ctx: ExecutionContext,
  ) => unknown;
};

describe('Auth decorators', () => {
  describe('CurrentUser', () => {
    it('should extract user from request', () => {
      const currentUserFactory = getParamDecoratorFactory(CurrentUser);
      const requestUser = { id: 'user-1', email: 'user@test.com' };
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: requestUser }),
        }),
      } as ExecutionContext;

      const result = currentUserFactory(undefined, context);

      expect(result).toEqual(requestUser);
    });
  });

  describe('CurrentContact', () => {
    it('should extract contact auth payload from request', () => {
      const currentContactFactory = getParamDecoratorFactory(CurrentContact);
      const requestContact = {
        contact: {
          id: 'contact-1',
          fullName: 'Contact Name',
          email: 'contact@test.com',
        },
        isProfileComplete: true,
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: requestContact }),
        }),
      } as ExecutionContext;

      const result = currentContactFactory(undefined, context);

      expect(result).toEqual(requestContact);
    });
  });
});
