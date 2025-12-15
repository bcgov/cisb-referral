import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  managerEmail?: string;

  @ApiPropertyOptional()
  supervisorEmail?: string;

  @ApiPropertyOptional()
  assistantSupervisorEmail?: string;

  @ApiPropertyOptional()
  sharedMailboxEmail?: string;
}
