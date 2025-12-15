import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import type {
  Referral,
  Region,
  Ministry,
  AgencyType,
  PaginatedResponse,
  FetchReferralsParams,
} from "../types";

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

  async fetchReferrals(
    params: FetchReferralsParams = {}
  ): Promise<PaginatedResponse<Referral>> {
    const response = await this.client.get<PaginatedResponse<Referral>>(
      "/referrals",
      { params }
    );
    return response.data;
  }

  async fetchReferral(id: string): Promise<Referral> {
    const response = await this.client.get<Referral>(`/referrals/${id}`);
    return response.data;
  }

  async fetchRegions(): Promise<Region[]> {
    const response = await this.client.get<Region[]>("/regions");
    return response.data;
  }

  async fetchMinistries(): Promise<Ministry[]> {
    const response = await this.client.get<Ministry[]>("/ministries");
    return response.data;
  }

  async fetchAgencyTypes(): Promise<AgencyType[]> {
    const response = await this.client.get<AgencyType[]>("/agency-types");
    return response.data;
  }
}

export const apiService = new APIService();
