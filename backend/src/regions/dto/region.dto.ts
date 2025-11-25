import { ApiProperty } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  managerUserId?: number;

  @ApiProperty({ required: false })
  managerEmail?: string;

  @ApiProperty({ required: false })
  supervisorUserId?: number;

  @ApiProperty({ required: false })
  supervisorEmail?: string;

  @ApiProperty({ required: false })
  assistantSupervisorUserId?: number;

  @ApiProperty({ required: false })
  assistantSupervisorEmail?: string;

  @ApiProperty({ required: false })
  teamMemberUserId?: number;

  @ApiProperty({ required: false })
  teamMemberEmail?: string;

  @ApiProperty({ required: false })
  sharedMailboxEmail?: string;
}
