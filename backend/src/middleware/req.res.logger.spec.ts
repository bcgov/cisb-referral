import { Test, TestingModule } from '@nestjs/testing';
import { HTTPLoggerMiddleware } from './req.res.logger';
import type { Request, Response } from 'express';

describe('HTTPLoggerMiddleware', () => {
  let middleware: HTTPLoggerMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HTTPLoggerMiddleware],
    }).compile();

    middleware = module.get<HTTPLoggerMiddleware>(HTTPLoggerMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log the correct information', () => {
    const request = {
      method: 'GET',
      originalUrl: '/test',
      get: () => 'Test User Agent',
    } as unknown as Request;

    const response = {
      statusCode: 200,
      get: () => '100',
      on: (event: string, cb: () => void) => {
        if (event === 'finish') {
          cb();
        }
      },
    } as unknown as Response;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const loggerSpy = jest.spyOn((middleware as any).logger, 'log');

    middleware.use(request, response, () => {});

    expect(loggerSpy).toHaveBeenCalledWith(
      'GET /test 200 100 - Test User Agent',
    );
  });
});
