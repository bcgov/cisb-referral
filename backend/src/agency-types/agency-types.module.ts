import { Module } from '@nestjs/common';
import { AgencyTypesController } from './agency-types.controller';
import { AgencyTypesService } from './agency-types.service';

@Module({
  controllers: [AgencyTypesController],
  providers: [AgencyTypesService],
  exports: [AgencyTypesService],
})
export class AgencyTypesModule {}
