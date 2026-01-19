import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakConfigService } from './config';

@Module({
  imports: [PassportModule],
  providers: [KeycloakConfigService],
  exports: [KeycloakConfigService],
})
export class AuthModule {}
