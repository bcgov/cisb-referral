import { Module } from '@nestjs/common';
import { AgencyTypesController } from './agency-types.controller';
import { AgencyTypesService } from './agency-types.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AgencyTypesController],
  providers: [AgencyTypesService],
  exports: [AgencyTypesService],
})
export class AgencyTypesModule {}
