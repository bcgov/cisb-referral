import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ReferralStatus } from './update-referral.dto';

export const REFERRAL_COLUMN_KEYS = [
  'flag',
  'createdAt',
  'updatedAt',
  'referralStatus',
  'referralOutcome',
  'referredBy',
  'ministry',
  'ministryNameOther',
  'agencyType',
  'agencyTypeOther',
  'partnerAgencyName',
  'programArea',
  'referrerContactName',
  'referrerEmail',
  'referrerPhone',
  'individualFirstName',
  'individualMiddleName',
  'individualLastName',
  'individualPreferredName',
  'individualDateOfBirth',
  'individualPhone',
  'personId',
  'secondaryContact',
  'bestWayToReach',
  'region',
  'specificCityTown',
  'experiencingHomelessness',
  'losingHouse',
  'pendingOrRecentlyReleased',
  'releaseDate',
  'currentlyConnectedSupports',
  'currentlyConnectedSupportsOther',
  'neededSupports',
  'neededSupportsOther',
  'referralReason',
  'communityPartnerName',
  'assignedTo',
  'assignedOn',
  'firstContactMadeOn',
  'lottTriage',
  'lottContact',
  'followUpDate',
  'dueDate',
  'completedDate',
] as const;

export type ReferralColumnKey = (typeof REFERRAL_COLUMN_KEYS)[number];

export const UNSORTABLE_REFERRAL_COLUMN_KEYS = [
  'currentlyConnectedSupports',
  'neededSupports',
] as const;

export const SORTABLE_REFERRAL_COLUMN_KEYS = REFERRAL_COLUMN_KEYS.filter(
  (key) =>
    !UNSORTABLE_REFERRAL_COLUMN_KEYS.includes(
      key as (typeof UNSORTABLE_REFERRAL_COLUMN_KEYS)[number],
    ),
);

export enum ReferralSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ReferralFilterOperator {
  EQUALS = 'equals',
  CONTAINS = 'contains',
}

function trimQueryString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class FindAllReferralsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: ReferralStatus })
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({
    description: 'Filter by keyword (contains) across referral columns',
  })
  @IsOptional()
  @Transform(trimQueryString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: SORTABLE_REFERRAL_COLUMN_KEYS,
    description: 'Sort by referral column key',
  })
  @IsOptional()
  @IsIn(SORTABLE_REFERRAL_COLUMN_KEYS)
  sortBy?: ReferralColumnKey;

  @ApiPropertyOptional({
    enum: ReferralSortOrder,
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(ReferralSortOrder)
  sortOrder?: ReferralSortOrder;

  @ApiPropertyOptional({
    enum: REFERRAL_COLUMN_KEYS,
    description: 'Column key to filter by',
  })
  @IsOptional()
  @IsIn(REFERRAL_COLUMN_KEYS)
  filterBy?: ReferralColumnKey;

  @ApiPropertyOptional({
    enum: ReferralFilterOperator,
    description:
      'Filter operator (contains/equals for text-like columns; equals only for flag, date, and numeric columns)',
  })
  @IsOptional()
  @IsEnum(ReferralFilterOperator)
  filterOperator?: ReferralFilterOperator;

  @ApiPropertyOptional({
    description: 'Filter value (free text)',
  })
  @IsOptional()
  @Transform(trimQueryString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  filterValue?: string;
}
