import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EitherAuthGuard } from './either-auth.guard';

describe('EitherAuthGuard', () => {
  let guard: EitherAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new EitherAuthGuard(reflector);
  });

  const createMockContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    }) as unknown as ExecutionContext;

  it('should allow access when route is public', async () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should succeed when admin guard passes', async () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(guard as any, 'tryGuard').mockResolvedValueOnce(true);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should fall back to contact guard when admin fails', async () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest
      .spyOn(guard as any, 'tryGuard')
      .mockRejectedValueOnce(new Error('admin failed'))
      .mockResolvedValueOnce(true);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when both guards fail', async () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest
      .spyOn(guard as any, 'tryGuard')
      .mockRejectedValueOnce(new Error('admin failed'))
      .mockRejectedValueOnce(new Error('contact failed'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
