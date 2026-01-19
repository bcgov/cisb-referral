import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakConfigService } from './config';
import { AdminJwtStrategy } from './strategies';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PassportModule, PrismaModule],
  providers: [KeycloakConfigService, AdminJwtStrategy],
  exports: [KeycloakConfigService],
})
export class AuthModule {}
