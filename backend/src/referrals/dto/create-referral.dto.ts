import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsUUID,
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
  referredBy!: ReferredByType;

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.referredBy === ReferredByType.PARTNER_MINISTRY,
  )
  @IsUUID()
  ministryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ministryNameOther?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  programArea?: string;

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.referredBy === ReferredByType.PARTNER_AGENCY,
  )
  @IsString()
  @MaxLength(200)
  partnerAgencyName?: string;

  @ApiProperty({ required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.referredBy === ReferredByType.PARTNER_AGENCY,
  )
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
  personId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  referrerContactName!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  referrerEmail!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(30)
  referrerPhone!: string;

  // Section 2: Individual Information
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  individualFirstName!: string;

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

  @ApiProperty()
  @IsUUID()
  regionId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  specificCityTown!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bestWayToReach?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  secondaryContact?: string;

  // Section 3: Housing Status & Critical Transitions
  @ApiProperty({ enum: YesNoUnknown })
  @IsEnum(YesNoUnknown)
  experiencingHomelessness!: YesNoUnknown;

  @ApiProperty({ enum: YesNoUnknown, required: false })
  @ValidateIf(
    (o: CreateReferralDto) => o.experiencingHomelessness !== YesNoUnknown.YES,
  )
  @IsEnum(YesNoUnknown)
  losingHouse?: YesNoUnknown;

  @ApiProperty({ enum: ReleaseFromType, required: false })
  @IsOptional()
  @IsEnum(ReleaseFromType)
  pendingOrRecentlyReleased?: ReleaseFromType;

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
  @MaxLength(500)
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
  @MaxLength(500)
  neededSupportsOther?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  referralReason!: string;
}
