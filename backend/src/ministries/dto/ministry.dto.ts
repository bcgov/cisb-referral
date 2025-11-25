import { ApiProperty } from '@nestjs/swagger';

export class MinistryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  acronym: string;

  @ApiProperty()
  isActive: boolean;
}
