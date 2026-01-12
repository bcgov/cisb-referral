import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { SupportType } from '@prisma/client';

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  currentlyConnectedSupports?: SupportType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentlyConnectedSupportsOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specificCityTown?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  neededSupports?: SupportType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  neededSupportsOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referralSummary?: string;

  // Referrer fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referrerContactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referrerEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referrerPhone?: string;

  // Individual fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  individualFirstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  individualMiddleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  individualLastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  individualPreferredName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  individualDateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  individualPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gainFile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondaryContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bestWayToReach?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentlyHomeless?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  losingHousing?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pendingRelease?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;
}
