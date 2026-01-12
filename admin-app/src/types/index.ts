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
  agencyTypeId: string | null;
  agencyType: AgencyType | null;
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
  city: string | null;
  homelessness: string | null;
  losingHousing: string | null;
  pendingRelease: string | null;
  releaseDate: string | null;
  currentlyConnectedSupports: string[];
  neededSupports: string[];
  additionalInformation: string | null;
  consentToContact: boolean;
  assignedToId: string | null;
  assignedOn: string | null;
  firstContactMadeOn: string | null;
  createdAt: string;
  updatedAt: string;
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
