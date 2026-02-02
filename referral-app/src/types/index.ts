export interface Region {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface AgencyType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface ReferralResponse {
  id: string;
  referralStatus: string;
  flag: boolean;
  createdAt: string;
  region?: Region;
  ministry?: Ministry;
  agencyType?: AgencyType;
}

export interface Contact {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  telephone: string | null;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SelectOption {
  readonly id: string;
  readonly name: string;
}
