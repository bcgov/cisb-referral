import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { customLogger } from './common/logger.config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { VersioningType, ValidationPipe } from '@nestjs/common';

/**
 *
 */
export async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: customLogger,
    });
  app.use(helmet());
  app.enableCors();
  app.set('trust proxy', 1);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('CISB Referral API')
    .setDescription(
      'API for Community Integration Support Branch (CISB) Referral System',
    )
    .setVersion('1.0')
    .addTag('referrals')
    .addTag('regions')
    .addTag('ministries')
    .addTag('agency-types')
    .addTag('users')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  return app;
}
