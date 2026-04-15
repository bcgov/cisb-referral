import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateIf,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum ReferredByType {
  PARTNER_MINISTRY = 'PARTNER_MINISTRY',
  SDPR_INTERNAL = 'SDPR_INTERNAL',
  PARTNER_AGENCY = 'PARTNER_AGENCY',
}

export enum YesNoUnknown {
  YES = 'YES',
  NO = 'NO',
  UNKNOWN = 'UNKNOWN',
}

export enum ReleaseFromType {
  NO = 'NO',
  HOSPITAL_MEDICAL_FACILITY = 'HOSPITAL_MEDICAL_FACILITY',
  CORRECTIONS = 'CORRECTIONS',
  YOUTH_TRANSITION_MCFD = 'YOUTH_TRANSITION_MCFD',
  YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY = 'YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY',
  ALCOHOL_DRUG_FACILITY = 'ALCOHOL_DRUG_FACILITY',
}

export enum SupportType {
  CULTURAL = 'CULTURAL',
  COMMUNITY_SUPPORTS = 'COMMUNITY_SUPPORTS',
  FOOD_SECURITY = 'FOOD_SECURITY',
  HOUSING = 'HOUSING',
  INCOME_ASSISTANCE_PROVINCIAL = 'INCOME_ASSISTANCE_PROVINCIAL',
  INCOME_ASSISTANCE_FEDERAL = 'INCOME_ASSISTANCE_FEDERAL',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  SYSTEM_NAVIGATION = 'SYSTEM_NAVIGATION',
  HEALTH_SERVICES = 'HEALTH_SERVICES',
  SUBSTANCE_USE = 'SUBSTANCE_USE',
  INDIGENOUS_SUPPORTS = 'INDIGENOUS_SUPPORTS',
  INTEGRATED_JUSTICE_SUPPORTS = 'INTEGRATED_JUSTICE_SUPPORTS',
  OTHERS = 'OTHERS',
}

export class CreateReferralDto {
  // Section 1: Referrer Information
  @ApiProperty({ enum: ReferredByType })
  @IsEnum(ReferredByType)
  referredBy: ReferredByType;

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.referredBy === ReferredByType.PARTNER_MINISTRY,
  )
  @IsString()
  ministryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ministryNameOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  programArea?: string;

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.referredBy === ReferredByType.PARTNER_AGENCY,
  )
  @IsString()
  partnerAgencyName?: string;

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.referredBy === ReferredByType.PARTNER_AGENCY,
  )
  @IsString()
  agencyTypeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agencyTypeOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  personId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  referrerContactName: string;

  @ApiProperty()
  @IsEmail()
  referrerEmail: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  referrerPhone: string;

  // Section 2: Individual Information
  @ApiProperty()
  @IsString()
  @MinLength(1)
  individualFirstName: string;

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

  @ApiProperty()
  @IsString()
  regionId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  specificCityTown: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bestWayToReach?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondaryContact?: string;

  // Section 3: Housing Status & Critical Transitions
  @ApiProperty({ enum: YesNoUnknown })
  @IsEnum(YesNoUnknown)
  currentlyHomeless: YesNoUnknown;

  @ApiProperty({ enum: YesNoUnknown, required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.currentlyHomeless !== YesNoUnknown.YES,
  )
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

  // Section 4: Support Services
  @ApiProperty({ type: [String], enum: SupportType, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(SupportType, { each: true })
  currentlyConnectedSupports?: SupportType[];

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) =>
      o.currentlyConnectedSupports?.includes(SupportType.OTHERS) ?? false,
  )
  @IsString()
  currentlyConnectedSupportsOther?: string;

  @ApiProperty({ type: [String], enum: SupportType, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(SupportType, { each: true })
  neededSupports?: SupportType[];

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) =>
      o.neededSupports?.includes(SupportType.OTHERS) ?? false,
  )
  @IsString()
  neededSupportsOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  referralSummary?: string;
}
