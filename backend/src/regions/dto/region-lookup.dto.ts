import { ApiProperty } from '@nestjs/swagger';

export class RegionLookupDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
