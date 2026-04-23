import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import type {
  Region,
  Ministry,
  AgencyType,
  ReferralResponse,
  ProfileResponse,
} from "../types";
import { keycloak } from "../auth";

export const TOKEN_MIN_VALIDITY = 30;

class APIService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "/api/v1",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          await keycloak.updateToken(TOKEN_MIN_VALIDITY);
        } catch {
          keycloak.logout({ redirectUri: globalThis.location.origin });
          throw new Error("Session expired");
        }

        if (keycloak.token) {
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        }

        return config;
      },
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => Promise.reject(error),
    );
  }

  async getProfile(): Promise<ProfileResponse> {
    const response = await this.client.get<ProfileResponse>("/contacts/me");
    return response.data;
  }

  async updateProfile(data: { phone: string }): Promise<ProfileResponse> {
    const response = await this.client.patch<ProfileResponse>(
      "/contacts/me",
      data,
    );
    return response.data;
  }

  async fetchRegions(): Promise<Region[]> {
    const response = await this.client.get<Region[]>("/regions/lookup");
    return response.data;
  }

  async fetchMinistries(activeOnly = true): Promise<Ministry[]> {
    const params = activeOnly ? { active: true } : {};
    const response = await this.client.get<Ministry[]>("/ministries", {
      params,
    });
    return response.data;
  }

  async fetchAgencyTypes(activeOnly = true): Promise<AgencyType[]> {
    const params = activeOnly ? { active: true } : {};
    const response = await this.client.get<AgencyType[]>("/agency-types", {
      params,
    });
    return response.data;
  }

  async createReferral(
    data: Record<string, unknown>,
  ): Promise<ReferralResponse> {
    // Remove empty strings - backend expects undefined for optional fields
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== ""),
    );
    const response = await this.client.post<ReferralResponse>(
      "/referrals",
      cleanedData,
    );
    return response.data;
  }
}

export const apiService = new APIService();
