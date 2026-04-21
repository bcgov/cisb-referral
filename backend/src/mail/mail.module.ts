import { Global, Module } from '@nestjs/common';
import { MailConfigService } from './mail.config';
import { MailService } from './mail.service';

@Global()
@Module({
  providers: [MailConfigService, MailService],
  exports: [MailService],
})
export class MailModule {}
