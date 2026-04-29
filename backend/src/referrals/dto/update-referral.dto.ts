import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsUUID,
  MaxLength,
  MinLength,
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
  @Transform(({ value }) => (value === '' ? null : value))
  @IsUUID()
  assignedToId?: string | null;

  @ApiProperty({ enum: ReferralOutcome, required: false })
  @IsOptional()
  @IsEnum(ReferralOutcome)
  referralOutcome?: ReferralOutcome;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
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
  @MaxLength(500)
  currentlyConnectedSupportsOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  specificCityTown?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(SupportType, { each: true })
  neededSupports?: SupportType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  neededSupportsOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  referralSummary?: string;

  // Referred By Info fields
  @ApiProperty({ enum: ReferredByType, required: false })
  @IsOptional()
  @IsEnum(ReferredByType)
  referredBy?: ReferredByType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  ministryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ministryNameOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  agencyTypeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  agencyTypeOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  partnerAgencyName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  programArea?: string;

  // Referrer fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  referrerContactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  referrerEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  @MinLength(10)
  @MaxLength(30)
  referrerPhone?: string | null;

  // Individual fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  individualFirstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  individualMiddleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  individualLastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  individualPreferredName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  individualDateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  individualPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  personId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  secondaryContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
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
