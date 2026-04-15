import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tableName!: string;

  @ApiProperty()
  recordId!: string;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional()
  field?: string | null;

  @ApiPropertyOptional()
  oldValue?: string | null;

  @ApiPropertyOptional()
  newValue?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  createdBy?: string | null;

  @ApiPropertyOptional()
  author?: { id: string; fullName: string } | null;
}

export class ReferralAuditLogDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  referralId!: string;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional()
  field?: string | null;

  @ApiPropertyOptional()
  oldValue?: string | null;

  @ApiPropertyOptional()
  newValue?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  createdBy?: string | null;

  @ApiPropertyOptional()
  author?: { id: string; fullName: string } | null;
}
