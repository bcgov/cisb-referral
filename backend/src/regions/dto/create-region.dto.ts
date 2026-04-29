import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateRegionDto {
  @ApiProperty({ description: 'Region name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ description: 'Manager email address' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  managerEmail?: string;

  @ApiPropertyOptional({ description: 'Supervisor email address' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  supervisorEmail?: string;

  @ApiPropertyOptional({ description: 'Assistant supervisor email address' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  assistantSupervisorEmail?: string;

  @ApiPropertyOptional({ description: 'Shared mailbox email address' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  sharedMailboxEmail?: string;
}
