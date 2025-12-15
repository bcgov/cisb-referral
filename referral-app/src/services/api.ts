import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import type { Region, Ministry, AgencyType, ReferralResponse } from "../types";

class APIService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "/api/v1",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.info(
          `[API] ${response.config.method?.toUpperCase()} ${
            response.config.url
          } - ${response.status}`
        );
        return response;
      },
      (error) => {
        console.error(
          "[API] Request failed:",
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  async fetchRegions(): Promise<Region[]> {
    const response = await this.client.get<Region[]>("/regions");
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
    data: Record<string, unknown>
  ): Promise<ReferralResponse> {
    const response = await this.client.post<ReferralResponse>(
      "/referrals",
      data
    );
    return response.data;
  }
}

export const apiService = new APIService();
