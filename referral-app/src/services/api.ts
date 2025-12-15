const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

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

class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorBody.message || `HTTP error ${response.status}`,
      errorBody
    );
  }
  return response.json();
}

export async function fetchRegions(): Promise<Region[]> {
  const response = await fetch(`${API_BASE_URL}/regions`);
  return handleResponse<Region[]>(response);
}

export async function fetchMinistries(activeOnly = true): Promise<Ministry[]> {
  const params = activeOnly ? "?active=true" : "";
  const response = await fetch(`${API_BASE_URL}/ministries${params}`);
  return handleResponse<Ministry[]>(response);
}

export async function fetchAgencyTypes(
  activeOnly = true
): Promise<AgencyType[]> {
  const params = activeOnly ? "?active=true" : "";
  const response = await fetch(`${API_BASE_URL}/agency-types${params}`);
  return handleResponse<AgencyType[]>(response);
}

export async function createReferral(
  data: Record<string, unknown>
): Promise<ReferralResponse> {
  const response = await fetch(`${API_BASE_URL}/referrals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ReferralResponse>(response);
}

export { ApiError };
