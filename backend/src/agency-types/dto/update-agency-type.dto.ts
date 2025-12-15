import { PartialType } from '@nestjs/swagger';
import { CreateAgencyTypeDto } from './create-agency-type.dto';

export class UpdateAgencyTypeDto extends PartialType(CreateAgencyTypeDto) {}
