import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MinistryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  code?: string;

  @ApiProperty()
  isActive: boolean;
}
