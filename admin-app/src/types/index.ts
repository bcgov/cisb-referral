export interface Region {
  id: string;
  name: string;
}

export interface Ministry {
  id: string;
  name: string;
}

export interface AgencyType {
  id: string;
  name: string;
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
