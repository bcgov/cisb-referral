import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SupportType } from '../../generated/prisma/client';
import {
  ReferredByType,
  YesNoUnknown,
  ReleaseFromType,
} from './create-referral.dto';

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
  @Transform(({ value }) => (value === '' ? null : value))
  assignedToId?: string | null;

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
  @IsEnum(SupportType, { each: true })
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
  @IsEnum(SupportType, { each: true })
  neededSupports?: SupportType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  neededSupportsOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referralSummary?: string;

  // Referred By Info fields
  @ApiProperty({ enum: ReferredByType, required: false })
  @IsOptional()
  @IsEnum(ReferredByType)
  referredBy?: ReferredByType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ministryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ministryNameOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agencyTypeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agencyTypeOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  partnerAgencyName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  programArea?: string;

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
  personId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondaryContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bestWayToReach?: string;

  @ApiProperty({ enum: YesNoUnknown, required: false })
  @IsOptional()
  @IsEnum(YesNoUnknown)
  currentlyHomeless?: YesNoUnknown;

  @ApiProperty({ enum: YesNoUnknown, required: false })
  @IsOptional()
  @IsEnum(YesNoUnknown)
  losingHousing?: YesNoUnknown;

  @ApiProperty({ enum: ReleaseFromType, required: false })
  @IsOptional()
  @IsEnum(ReleaseFromType)
  pendingRelease?: ReleaseFromType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;
}
