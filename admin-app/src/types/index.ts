export interface Region {
  id: string;
  name: string;
  managerEmail?: string | null;
  supervisorEmail?: string | null;
  assistantSupervisorEmail?: string | null;
  sharedMailboxEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ministry {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
}

export interface AgencyType {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
}

export interface CreateRegionDto {
  name: string;
  managerEmail?: string;
  supervisorEmail?: string;
  assistantSupervisorEmail?: string;
  sharedMailboxEmail?: string;
}

export interface UpdateRegionDto {
  name?: string;
  managerEmail?: string;
  supervisorEmail?: string;
  assistantSupervisorEmail?: string;
  sharedMailboxEmail?: string;
}

export interface CreateMinistryDto {
  name: string;
  isActive?: boolean;
}

export interface UpdateMinistryDto {
  name?: string;
  isActive?: boolean;
}

export interface CreateAgencyTypeDto {
  name: string;
  isActive?: boolean;
}

export interface UpdateAgencyTypeDto {
  name?: string;
  isActive?: boolean;
}

export interface Referral {
  id: string;
  flag: boolean;
  referralStatus: string;
  referralOutcome: string | null;
  referredBy: string;
  ministryId: string | null;
  ministry: Ministry | null;
  ministryNameOther: string | null;
  agencyTypeId: string | null;
  agencyType: AgencyType | null;
  agencyTypeOther: string | null;
  partnerAgencyName: string | null;
  programArea: string | null;
  referrerContactName: string;
  referrerContactEmail: string;
  referrerContactPhone: string | null;
  individualFirstName: string;
  individualLastName: string;
  individualPreferredName: string | null;
  individualDateOfBirth: string | null;
  individualPronouns: string | null;
  individualEmail: string | null;
  individualPhone: string | null;
  regionId: string | null;
  region: Region | null;
  specificCityTown: string | null;
  currentlyHomeless: string | null;
  losingHousing: string | null;
  pendingRelease: string | null;
  releaseDate: string | null;
  currentlyConnectedSupports: string[];
  currentlyConnectedSupportsOther: string | null;
  neededSupports: string[];
  neededSupportsOther: string | null;
  referralSummary: string | null;
  communityPartnerName: string | null;
  assignedToId: string | null;
  assignedTo: User | null;
  assignedOn: string | null;
  firstContactMadeOn: string | null;
  followUpDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ReferralStatus = {
  OPEN: "OPEN",
  ASSIGNED: "ASSIGNED",
  CONTACT_MADE: "CONTACT_MADE",
  CLOSED: "CLOSED",
} as const;

export type ReferralStatus =
  (typeof ReferralStatus)[keyof typeof ReferralStatus];

export const ReferralOutcome = {
  BCEA_APPLICATION_SUBMITTED: "BCEA_APPLICATION_SUBMITTED",
  BCEA_APPLICATION_COMPLETED_FILE_OPENED:
    "BCEA_APPLICATION_COMPLETED_FILE_OPENED",
  SUPPLEMENTS_ISSUED: "SUPPLEMENTS_ISSUED",
  CASE_MANAGED: "CASE_MANAGED",
  SERVICES_PROVIDED: "SERVICES_PROVIDED",
  NOT_LOCATED: "NOT_LOCATED",
  LOCATED_REFUSED_SERVICE: "LOCATED_REFUSED_SERVICE",
  NON_APPROPRIATE_REFERRAL_RETURNED: "NON_APPROPRIATE_REFERRAL_RETURNED",
  REFERRED_TO_VS_CS: "REFERRED_TO_VS_CS",
  REFERRED_TO_COMMUNITY_PARTNER: "REFERRED_TO_COMMUNITY_PARTNER",
} as const;

export type ReferralOutcome =
  (typeof ReferralOutcome)[keyof typeof ReferralOutcome];

export interface UpdateReferralDto {
  referralStatus?: ReferralStatus;
  assignedToId?: string | null;
  referralOutcome?: ReferralOutcome | null;
  communityPartnerName?: string | null;
  flag?: boolean;
  assignedOn?: string | null;
  firstContactMadeOn?: string | null;
  followUpDate?: string | null;
  dueDate?: string | null;
  completedDate?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchReferralsParams {
  page?: number;
  limit?: number;
  status?: string;
  regionId?: string;
}

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  SYSTEM_ADMINISTRATOR: "SYSTEM_ADMINISTRATOR",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  fullName: string;
  email: string;
  address?: string | null;
  contact?: string | null;
  role: UserRole;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  address?: string;
  contact?: string;
  role?: UserRole;
  isActive?: boolean;
}
