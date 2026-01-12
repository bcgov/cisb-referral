import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export enum ReferralStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  CONTACT_MADE = 'CONTACT_MADE',
  CLOSED = 'CLOSED',
}

export enum ReferralOutcome {
  BCEA_APPLICATION_SUBMITTED = 'BCEA_APPLICATION_SUBMITTED',
  BCEA_APPLICATION_COMPLETED_FILE_OPENED = 'BCEA_APPLICATION_COMPLETED_FILE_OPENED',
  SUPPLEMENTS_ISSUED = 'SUPPLEMENTS_ISSUED',
  CASE_MANAGED = 'CASE_MANAGED',
  SERVICES_PROVIDED = 'SERVICES_PROVIDED',
  NOT_LOCATED = 'NOT_LOCATED',
  LOCATED_REFUSED_SERVICE = 'LOCATED_REFUSED_SERVICE',
  NON_APPROPRIATE_REFERRAL_RETURNED = 'NON_APPROPRIATE_REFERRAL_RETURNED',
  REFERRED_TO_VS_CS = 'REFERRED_TO_VS_CS',
  REFERRED_TO_COMMUNITY_PARTNER = 'REFERRED_TO_COMMUNITY_PARTNER',
}

export class UpdateReferralDto {
  @ApiProperty({ enum: ReferralStatus, required: false })
  @IsOptional()
  @IsEnum(ReferralStatus)
  referralStatus?: ReferralStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiProperty({ enum: ReferralOutcome, required: false })
  @IsOptional()
  @IsEnum(ReferralOutcome)
  referralOutcome?: ReferralOutcome;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  communityPartnerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  flag?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  assignedOn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  firstContactMadeOn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  completedDate?: string;
}
