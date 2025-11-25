import { ApiProperty } from '@nestjs/swagger';

export class AgencyTypeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;
}
