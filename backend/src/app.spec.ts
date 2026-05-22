import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { bootstrap, shouldExposeSwagger } from './app';

type JestMock = ReturnType<typeof jest.fn>;

function getNestCreateMock(): JestMock {
  const nestCore = jest.requireMock<{
    NestFactory: Record<'create', JestMock>;
  }>('@nestjs/core');
  return nestCore.NestFactory['create'];
}

function getSwaggerMocks(): {
  createDocument: JestMock;
  setup: JestMock;
} {
  const swagger = jest.requireMock<{
    SwaggerModule: Record<'createDocument' | 'setup', JestMock>;
  }>('@nestjs/swagger');
  return {
    createDocument: swagger.SwaggerModule['createDocument'],
    setup: swagger.SwaggerModule['setup'],
  };
}

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => {
  const actual =
    jest.requireActual<typeof import('@nestjs/swagger')>('@nestjs/swagger');
  const builder = {
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  };

  return {
    ...actual,
    DocumentBuilder: jest.fn(() => builder),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
  };
});

jest.mock('helmet', () => jest.fn(() => jest.fn()));

describe('bootstrap', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const mockApp = {
    use: jest.fn(),
    enableCors: jest.fn(),
    set: jest.fn(),
    enableShutdownHooks: jest.fn(),
    setGlobalPrefix: jest.fn(),
    enableVersioning: jest.fn(),
    useGlobalPipes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getSwaggerMocks().createDocument.mockReturnValue({});
    getNestCreateMock().mockResolvedValue(mockApp);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should expose Swagger outside production', async () => {
    process.env.NODE_ENV = 'development';

    await bootstrap();

    const swagger = getSwaggerMocks();
    expect(shouldExposeSwagger()).toBe(true);
    expect(swagger.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({ use: mockApp.use }),
      expect.any(Object),
    );
    expect(swagger.setup).toHaveBeenCalledWith(
      'api/docs',
      expect.objectContaining({ use: mockApp.use }),
      expect.any(Object),
    );
  });

  it('should skip Swagger document creation and setup in production', async () => {
    process.env.NODE_ENV = 'production';

    await bootstrap();

    const swagger = getSwaggerMocks();
    expect(shouldExposeSwagger()).toBe(false);
    expect(swagger.createDocument).not.toHaveBeenCalled();
    expect(swagger.setup).not.toHaveBeenCalled();
  });
});
