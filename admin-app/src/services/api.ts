import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import type {
  Referral,
  Region,
  Ministry,
  AgencyType,
  PaginatedResponse,
  FetchReferralsParams,
  CreateRegionDto,
  UpdateRegionDto,
  CreateMinistryDto,
  UpdateMinistryDto,
  CreateAgencyTypeDto,
  UpdateAgencyTypeDto,
  User,
  CreateUserDto,
  UpdateUserDto,
  UserRole,
  UpdateReferralDto,
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

  async fetchReferrals(
    params: FetchReferralsParams = {},
  ): Promise<PaginatedResponse<Referral>> {
    const response = await this.client.get<PaginatedResponse<Referral>>(
      "/referrals",
      { params },
    );
    return response.data;
  }

  async fetchReferral(id: string): Promise<Referral> {
    const response = await this.client.get<Referral>(`/referrals/${id}`);
    return response.data;
  }

  async updateReferral(id: string, data: UpdateReferralDto): Promise<Referral> {
    const response = await this.client.patch<Referral>(
      `/referrals/${id}`,
      data,
    );
    return response.data;
  }

  async fetchRegions(): Promise<Region[]> {
    const response = await this.client.get<Region[]>("/regions");
    return response.data;
  }

  async createRegion(data: CreateRegionDto): Promise<Region> {
    const response = await this.client.post<Region>("/regions", data);
    return response.data;
  }

  async updateRegion(id: string, data: UpdateRegionDto): Promise<Region> {
    const response = await this.client.put<Region>(`/regions/${id}`, data);
    return response.data;
  }

  async fetchMinistries(): Promise<Ministry[]> {
    const response = await this.client.get<Ministry[]>("/ministries");
    return response.data;
  }

  async createMinistry(data: CreateMinistryDto): Promise<Ministry> {
    const response = await this.client.post<Ministry>("/ministries", data);
    return response.data;
  }

  async updateMinistry(id: string, data: UpdateMinistryDto): Promise<Ministry> {
    const response = await this.client.put<Ministry>(`/ministries/${id}`, data);
    return response.data;
  }

  async fetchAgencyTypes(): Promise<AgencyType[]> {
    const response = await this.client.get<AgencyType[]>("/agency-types");
    return response.data;
  }

  async createAgencyType(data: CreateAgencyTypeDto): Promise<AgencyType> {
    const response = await this.client.post<AgencyType>("/agency-types", data);
    return response.data;
  }

  async updateAgencyType(
    id: string,
    data: UpdateAgencyTypeDto,
  ): Promise<AgencyType> {
    const response = await this.client.put<AgencyType>(
      `/agency-types/${id}`,
      data,
    );
    return response.data;
  }

  async deleteRegion(id: string): Promise<void> {
    await this.client.delete(`/regions/${id}`);
  }

  async deleteMinistry(id: string): Promise<void> {
    await this.client.delete(`/ministries/${id}`);
  }

  async deleteAgencyType(id: string): Promise<void> {
    await this.client.delete(`/agency-types/${id}`);
  }

  async fetchUsers(role?: UserRole, isActive?: boolean): Promise<User[]> {
    const params: Record<string, string> = {};
    if (role) params.role = role;
    if (isActive !== undefined) params.isActive = String(isActive);
    const response = await this.client.get<User[]>("/users", { params });
    return response.data;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await this.client.post<User>("/users", data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.client.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<User> {
    const response = await this.client.delete<User>(`/users/${id}`);
    return response.data;
  }
}

export const apiService = new APIService();
