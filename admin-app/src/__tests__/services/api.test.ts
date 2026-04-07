import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";

/**
 * API Service configuration constants
 * These should match the values in src/services/api.ts
 */
const API_CONFIG = {
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
} as const;

// Import the actual constant to ensure tests stay in sync with implementation
let TOKEN_MIN_VALIDITY: number;

// Mock the auth module before importing api service
const mockKeycloak = {
  updateToken: vi.fn(),
  logout: vi.fn(),
  token: null as string | null,
};

vi.mock("../../auth", () => ({
  keycloak: mockKeycloak,
}));

// Mock axios
const mockAxiosCreate = vi.fn();
const mockRequestInterceptor = vi.fn();
const mockResponseInterceptor = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: (config: unknown) => {
      mockAxiosCreate(config);
      return {
        interceptors: {
          request: { use: mockRequestInterceptor },
          response: { use: mockResponseInterceptor },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      };
    },
  },
}));

describe("APIService", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockKeycloak.token = null;
    mockKeycloak.updateToken.mockReset();
    mockKeycloak.logout.mockReset();

    // Import actual constant to ensure tests match implementation
    const apiModule = await import("../../services/api");
    TOKEN_MIN_VALIDITY = apiModule.TOKEN_MIN_VALIDITY;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should create axios client with correct base configuration", async () => {
      // Act
      await import("../../services/api");

      // Assert
      expect(mockAxiosCreate).toHaveBeenCalledWith(API_CONFIG);
    });

    it("should register request and response interceptors", async () => {
      // Act
      await import("../../services/api");

      // Assert
      expect(mockRequestInterceptor).toHaveBeenCalledTimes(1);
      expect(mockResponseInterceptor).toHaveBeenCalledTimes(1);
    });
  });

  describe("request interceptor", () => {
    it("should refresh token before each request using configured validity period", async () => {
      // Arrange
      mockKeycloak.updateToken.mockResolvedValue(true);
      mockKeycloak.token = "valid-token";

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockConfig = {
        headers: {
          set: vi.fn(),
        },
      } as unknown as InternalAxiosRequestConfig;

      // Act
      await requestInterceptorFn(mockConfig);

      // Assert - uses the actual exported constant, not a hardcoded value
      expect(mockKeycloak.updateToken).toHaveBeenCalledWith(TOKEN_MIN_VALIDITY);
    });

    it("should proactively refresh token to prevent mid-request expiration", async () => {
      // Arrange
      mockKeycloak.updateToken.mockResolvedValue(true);
      mockKeycloak.token = "valid-token";

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      // Act
      await requestInterceptorFn(mockConfig);

      // Assert - updateToken is called with a buffer period to ensure
      // the token won't expire during the request
      expect(mockKeycloak.updateToken).toHaveBeenCalledTimes(1);
      expect(TOKEN_MIN_VALIDITY).toBeGreaterThan(0);
    });

    it("should add Bearer token to request headers when token exists", async () => {
      // Arrange
      mockKeycloak.updateToken.mockResolvedValue(true);
      mockKeycloak.token = "test-jwt-token";

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockHeaders = { Authorization: "" };
      const mockConfig = {
        headers: mockHeaders,
      } as unknown as InternalAxiosRequestConfig;

      // Act
      const result = await requestInterceptorFn(mockConfig);

      // Assert
      expect(result.headers.Authorization).toBe("Bearer test-jwt-token");
    });

    it("should not add Authorization header when token is null", async () => {
      // Arrange
      mockKeycloak.updateToken.mockResolvedValue(true);
      mockKeycloak.token = null;

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockHeaders = {};
      const mockConfig = {
        headers: mockHeaders,
      } as unknown as InternalAxiosRequestConfig;

      // Act
      const result = await requestInterceptorFn(mockConfig);

      // Assert
      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should logout and throw error when token refresh fails", async () => {
      // Arrange
      mockKeycloak.updateToken.mockRejectedValue(new Error("Token expired"));

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      // Act & Assert
      await expect(requestInterceptorFn(mockConfig)).rejects.toThrow(
        "Session expired",
      );
      expect(mockKeycloak.logout).toHaveBeenCalledWith({
        redirectUri: globalThis.location.origin,
      });
    });

    it("should use globalThis.location.origin for logout redirect", async () => {
      // Arrange
      mockKeycloak.updateToken.mockRejectedValue(new Error("Token expired"));

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      // Act & Assert - verifies we use browser origin, preventing open redirect
      try {
        await requestInterceptorFn(mockConfig);
      } catch {
        // Expected to throw
      }
      expect(mockKeycloak.logout).toHaveBeenCalledWith({
        redirectUri: globalThis.location.origin,
      });
    });
  });

  describe("response interceptor", () => {
    it("should pass through successful responses unchanged", async () => {
      // Arrange
      await import("../../services/api");
      const responseSuccessFn = mockResponseInterceptor.mock.calls[0][0];
      const mockResponse = { data: { id: 1 }, status: 200 };

      // Act
      const result = responseSuccessFn(mockResponse);

      // Assert
      expect(result).toEqual(mockResponse);
    });

    it("should throw errors from failed responses", async () => {
      // Arrange
      await import("../../services/api");
      const responseErrorFn = mockResponseInterceptor.mock.calls[0][1];
      const mockError = new Error("Network Error");

      // Act & Assert
      await expect(responseErrorFn(mockError)).rejects.toThrow("Network Error");
    });
  });
});
