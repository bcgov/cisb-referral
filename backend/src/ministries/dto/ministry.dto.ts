import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MinistryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;
}
