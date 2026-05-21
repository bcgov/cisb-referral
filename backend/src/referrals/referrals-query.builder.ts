import {
  ReferredByType,
  SupportType,
  YesNoUnknown,
  ReleaseFromType,
} from './dto/create-referral.dto';
import { BadRequestException } from '@nestjs/common';
import { ReferralStatus, ReferralOutcome } from './dto/update-referral.dto';
import {
  FindAllReferralsDto,
  ReferralColumnKey,
  ReferralFilterOperator,
  ReferralSortOrder,
} from './dto/find-all-referrals.dto';
import { Prisma } from '../generated/prisma/client';

export const REFERRAL_INCLUDE = {
  region: true,
  ministry: true,
  agencyType: true,
  assignedTo: true,
} satisfies Prisma.ReferralInclude;

const GLOBAL_SEARCH_STRING_FIELDS = [
  'ministryNameOther',
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
  'individualPhone',
  'personId',
  'secondaryContact',
  'bestWayToReach',
  'specificCityTown',
  'currentlyConnectedSupportsOther',
  'neededSupportsOther',
  'referralReason',
  'communityPartnerName',
] as const;

const DATE_COLUMN_KEYS = [
  'createdAt',
  'updatedAt',
  'individualDateOfBirth',
  'releaseDate',
  'assignedOn',
  'firstContactMadeOn',
  'followUpDate',
  'dueDate',
  'completedDate',
] as const;

const ENUM_COLUMN_KEYS = [
  'referralStatus',
  'referralOutcome',
  'referredBy',
  'experiencingHomelessness',
  'losingHouse',
  'pendingOrRecentlyReleased',
] as const;

const SEARCHABLE_ENUM_VALUES = {
  referralStatus: Object.values(ReferralStatus),
  referralOutcome: Object.values(ReferralOutcome),
  referredBy: Object.values(ReferredByType),
  experiencingHomelessness: Object.values(YesNoUnknown),
  losingHouse: Object.values(YesNoUnknown),
  pendingOrRecentlyReleased: Object.values(ReleaseFromType),
};

const SEARCHABLE_ENUM_LABELS: Record<string, Record<string, string>> = {
  referralStatus: {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    CONTACT_MADE: 'Contact-Made',
    CLOSED: 'Closed',
  },
  referralOutcome: {
    BCEA_APPLICATION_SUBMITTED: 'BCEA Application Submitted',
    BCEA_APPLICATION_COMPLETED_FILE_OPENED:
      'BCEA Application Completed - File Opened',
    SUPPLEMENTS_ISSUED: 'Supplements Issued',
    CASE_MANAGED: 'Case Managed',
    SERVICES_PROVIDED: 'Nonfinancial Supports Provided',
    NOT_LOCATED: 'Not Located',
    LOCATED_REFUSED_SERVICE: 'Located - Refused Service',
    NON_APPROPRIATE_REFERRAL_RETURNED: 'Non-Appropriate Referral - Returned',
    REFERRED_TO_VS_CS: 'Referred to VS/CS',
    REFERRED_TO_COMMUNITY_PARTNER: 'Referred to Community Partner',
  },
  referredBy: {
    PARTNER_MINISTRY: 'Partner Ministry',
    SDPR_INTERNAL: 'SDPR Internal',
    PARTNER_AGENCY: 'Partner Agency',
  },
  experiencingHomelessness: {
    YES: 'Yes',
    NO: 'No',
    UNKNOWN: 'Unknown',
  },
  losingHouse: {
    YES: 'Yes',
    NO: 'No',
    UNKNOWN: 'Unknown',
  },
  pendingOrRecentlyReleased: {
    NO: 'No',
    HOSPITAL_MEDICAL_FACILITY: 'Hospital/Medical Facility',
    CORRECTIONS: 'Corrections',
    YOUTH_TRANSITION_MCFD: 'Youth Transition (MCFD)',
    YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY:
      'Youth Transition (Delegated Aboriginal Agency)',
    ALCOHOL_DRUG_FACILITY: 'Alcohol/Drug Facility',
  },
};

const SUPPORT_VALUES = Object.values(SupportType);

const SUPPORT_LABELS: Record<string, string> = {
  CULTURAL: 'Cultural',
  COMMUNITY_SUPPORTS: 'Community Supports',
  FOOD_SECURITY: 'Food Security',
  HOUSING: 'Housing',
  INCOME_ASSISTANCE_PROVINCIAL: 'Income Assistance (Provincial)',
  INCOME_ASSISTANCE_FEDERAL: 'Income Assistance (Federal)',
  MENTAL_HEALTH: 'Mental Health',
  SYSTEM_NAVIGATION: 'System Navigation',
  HEALTH_SERVICES: 'Health Services',
  SUBSTANCE_USE: 'Substance Use',
  INDIGENOUS_SUPPORTS: 'Indigenous Supports',
  INTEGRATED_JUSTICE_SUPPORTS: 'Integrated Justice Supports',
  OTHERS: 'Others',
};

// ---------------------------------------------------------------------------
// Prisma filter helpers
// ---------------------------------------------------------------------------

function containsInsensitive(value: string) {
  return { contains: value, mode: 'insensitive' as const };
}

function equalsInsensitive(value: string) {
  return { equals: value, mode: 'insensitive' as const };
}

// ---------------------------------------------------------------------------
// Value-parsing utilities
// ---------------------------------------------------------------------------

function toNormalized(value: string): string {
  return value.trim().toLowerCase();
}

function toComparable(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

export function parseBooleanToken(value: string): boolean | undefined {
  const normalized = toNormalized(value);
  if (['yes', 'y', 'true', '1'].includes(normalized)) {
    return true;
  }
  if (['no', 'n', 'false', '0'].includes(normalized)) {
    return false;
  }
  return undefined;
}

export function parseDateRange(
  value: string,
): { gte: Date; lt: Date } | undefined {
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  const start = new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    ),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { gte: start, lt: end };
}

export function parseNumberToken(value: string): number | undefined {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function findEnumMatches(
  values: readonly string[],
  input: string,
  operator: ReferralFilterOperator,
  labels: Record<string, string> = {},
): string[] {
  const normalized = toComparable(input);
  if (!normalized) {
    return [];
  }

  return values.filter((value) => {
    const candidates = [value, value.replaceAll('_', ' '), labels[value]]
      .filter((candidate): candidate is string => Boolean(candidate))
      .map(toComparable)
      .filter(Boolean);

    return operator === ReferralFilterOperator.EQUALS
      ? candidates.includes(normalized)
      : candidates.some((candidate) => candidate.includes(normalized));
  });
}

function requireColumnFilter(
  filter: Prisma.ReferralWhereInput | undefined,
  filterBy: ReferralColumnKey,
): Prisma.ReferralWhereInput {
  if (filter) {
    return filter;
  }

  throw new BadRequestException(`Invalid filter value for ${filterBy}`);
}

// ---------------------------------------------------------------------------
// Per-type filter builders
// ---------------------------------------------------------------------------

function buildStringFilter(
  value: string,
  operator: ReferralFilterOperator,
):
  | { contains: string; mode: 'insensitive' }
  | { equals: string; mode: 'insensitive' } {
  return operator === ReferralFilterOperator.EQUALS
    ? equalsInsensitive(value)
    : containsInsensitive(value);
}

function buildEnumFilter(
  field: (typeof ENUM_COLUMN_KEYS)[number],
  value: string,
  operator: ReferralFilterOperator,
): Prisma.ReferralWhereInput | undefined {
  const matches = findEnumMatches(
    SEARCHABLE_ENUM_VALUES[field],
    value,
    operator,
    SEARCHABLE_ENUM_LABELS[field],
  );
  if (matches.length === 0) {
    return undefined;
  }
  return matches.length === 1
    ? { [field]: matches[0] }
    : { [field]: { in: matches } };
}

function buildDateFilter(
  field: (typeof DATE_COLUMN_KEYS)[number],
  value: string,
): Prisma.ReferralWhereInput | undefined {
  const range = parseDateRange(value);
  return range ? { [field]: range } : undefined;
}

function buildNumericFilter(
  field: 'lottTriage' | 'lottContact',
  value: string,
): Prisma.ReferralWhereInput | undefined {
  const parsed = parseNumberToken(value);
  return parsed === undefined ? undefined : { [field]: parsed };
}

function buildRelationFilter(
  field: 'region' | 'ministry' | 'agencyType' | 'assignedTo',
  value: string,
  operator: ReferralFilterOperator,
): Prisma.ReferralWhereInput {
  const filter = buildStringFilter(value, operator);
  switch (field) {
    case 'region':
      return { region: { name: filter } };
    case 'ministry':
      return { ministry: { name: filter } };
    case 'agencyType':
      return { agencyType: { name: filter } };
    case 'assignedTo':
      return { assignedTo: { fullName: filter } };
  }
}

function buildSupportArrayFilter(
  field: 'currentlyConnectedSupports' | 'neededSupports',
  value: string,
  operator: ReferralFilterOperator,
): Prisma.ReferralWhereInput | undefined {
  const matches = findEnumMatches(
    SUPPORT_VALUES,
    value,
    operator,
    SUPPORT_LABELS,
  );
  if (matches.length === 0) {
    return undefined;
  }

  if (operator === ReferralFilterOperator.EQUALS && matches.length === 1) {
    return { [field]: { has: matches[0] as SupportType } };
  }

  return { [field]: { hasSome: matches as SupportType[] } };
}

// ---------------------------------------------------------------------------
// Composite query builders (exported for use in the service)
// ---------------------------------------------------------------------------

function buildColumnFilter(
  filterBy?: ReferralColumnKey,
  filterOperator?: ReferralFilterOperator,
  filterValue?: string,
): Prisma.ReferralWhereInput | undefined {
  if (!filterBy || !filterValue?.trim()) {
    return undefined;
  }

  const value = filterValue.trim();
  const operator = filterOperator ?? ReferralFilterOperator.CONTAINS;

  switch (filterBy) {
    case 'flag': {
      const parsed = parseBooleanToken(value);
      if (parsed === undefined) {
        throw new BadRequestException(`Invalid filter value for ${filterBy}`);
      }
      return { flag: parsed };
    }
    case 'region':
    case 'ministry':
    case 'agencyType':
    case 'assignedTo':
      return buildRelationFilter(filterBy, value, operator);
    case 'referralStatus':
    case 'referralOutcome':
    case 'referredBy':
    case 'experiencingHomelessness':
    case 'losingHouse':
    case 'pendingOrRecentlyReleased':
      return requireColumnFilter(
        buildEnumFilter(filterBy, value, operator),
        filterBy,
      );
    case 'createdAt':
    case 'updatedAt':
    case 'individualDateOfBirth':
    case 'releaseDate':
    case 'assignedOn':
    case 'firstContactMadeOn':
    case 'followUpDate':
    case 'dueDate':
    case 'completedDate':
      return requireColumnFilter(buildDateFilter(filterBy, value), filterBy);
    case 'lottTriage':
    case 'lottContact':
      return requireColumnFilter(buildNumericFilter(filterBy, value), filterBy);
    case 'currentlyConnectedSupports':
    case 'neededSupports':
      return requireColumnFilter(
        buildSupportArrayFilter(filterBy, value, operator),
        filterBy,
      );
    default:
      return { [filterBy]: buildStringFilter(value, operator) };
  }
}

function buildGlobalSearch(
  search?: string,
): Prisma.ReferralWhereInput | undefined {
  const value = search?.trim();
  if (!value) {
    return undefined;
  }

  const orFilters: Prisma.ReferralWhereInput[] =
    GLOBAL_SEARCH_STRING_FIELDS.map((field) => ({
      [field]: containsInsensitive(value),
    }));

  orFilters.push(
    { region: { name: containsInsensitive(value) } },
    { ministry: { name: containsInsensitive(value) } },
    { agencyType: { name: containsInsensitive(value) } },
    { assignedTo: { fullName: containsInsensitive(value) } },
  );

  for (const enumField of ENUM_COLUMN_KEYS) {
    const filter = buildEnumFilter(
      enumField,
      value,
      ReferralFilterOperator.CONTAINS,
    );
    if (filter) {
      orFilters.push(filter);
    }
  }

  const supportMatches = findEnumMatches(
    SUPPORT_VALUES,
    value,
    ReferralFilterOperator.CONTAINS,
    SUPPORT_LABELS,
  );
  if (supportMatches.length > 0) {
    orFilters.push(
      {
        currentlyConnectedSupports: {
          hasSome: supportMatches as SupportType[],
        },
      },
      { neededSupports: { hasSome: supportMatches as SupportType[] } },
    );
  }

  const parsedBoolean = parseBooleanToken(value);
  if (parsedBoolean !== undefined) {
    orFilters.push({ flag: parsedBoolean });
  }

  const parsedNumber = parseNumberToken(value);
  if (parsedNumber !== undefined) {
    orFilters.push({ lottTriage: parsedNumber }, { lottContact: parsedNumber });
  }

  for (const dateField of DATE_COLUMN_KEYS) {
    const filter = buildDateFilter(dateField, value);
    if (filter) {
      orFilters.push(filter);
    }
  }

  return { OR: orFilters };
}

export function buildWhere(
  params: FindAllReferralsDto,
): Prisma.ReferralWhereInput {
  const andClauses: Prisma.ReferralWhereInput[] = [];

  const globalSearch = buildGlobalSearch(params.search);
  if (globalSearch) {
    andClauses.push(globalSearch);
  }

  const columnFilter = buildColumnFilter(
    params.filterBy,
    params.filterOperator,
    params.filterValue,
  );
  if (columnFilter) {
    andClauses.push(columnFilter);
  }

  return {
    ...(params.status && { referralStatus: params.status }),
    ...(params.regionId && { regionId: params.regionId }),
    ...(params.assignedToId && { assignedToId: params.assignedToId }),
    ...(andClauses.length > 0 && { AND: andClauses }),
  };
}

export function buildOrderBy(
  sortBy?: ReferralColumnKey,
  sortOrder?: ReferralSortOrder,
): Prisma.ReferralOrderByWithRelationInput {
  if (!sortBy) {
    return { createdAt: 'desc' };
  }

  const order: Prisma.SortOrder =
    sortOrder === ReferralSortOrder.ASC ? 'asc' : 'desc';

  switch (sortBy) {
    case 'region':
      return { region: { name: order } };
    case 'ministry':
      return { ministry: { name: order } };
    case 'agencyType':
      return { agencyType: { name: order } };
    case 'assignedTo':
      return { assignedTo: { fullName: order } };
    case 'currentlyConnectedSupports':
    case 'neededSupports':
      throw new BadRequestException(`${sortBy} cannot be sorted`);
    default:
      return { [sortBy]: order };
  }
}
