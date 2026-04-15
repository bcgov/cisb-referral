import { Module } from '@nestjs/common';
import { MinistriesController } from './ministries.controller';
import { MinistriesService } from './ministries.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [MinistriesController],
  providers: [MinistriesService],
  exports: [MinistriesService],
})
export class MinistriesModule {}
