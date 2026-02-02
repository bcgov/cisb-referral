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
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: (config: unknown) => {
      mockAxiosCreate(config);
      return {
        interceptors: {
          request: { use: mockRequestInterceptor },
          response: { use: mockResponseInterceptor },
        },
        get: mockGet,
        post: mockPost,
        patch: mockPatch,
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

  describe("request interceptor - token handling", () => {
    it("should refresh token before each request using configured validity period", async () => {
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

      // Assert - uses the actual exported constant, not a hardcoded value
      expect(mockKeycloak.updateToken).toHaveBeenCalledWith(TOKEN_MIN_VALIDITY);
    });

    it("should add Bearer token to Authorization header", async () => {
      // Arrange
      mockKeycloak.updateToken.mockResolvedValue(true);
      mockKeycloak.token = "test-jwt-token";

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      // Act
      const result = await requestInterceptorFn(mockConfig);

      // Assert - Bearer prefix is critical for proper auth header format
      expect(result.headers.Authorization).toBe("Bearer test-jwt-token");
    });

    it("should not add Authorization header if token is null", async () => {
      // Arrange
      mockKeycloak.updateToken.mockResolvedValue(true);
      mockKeycloak.token = null;

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      // Act
      const result = await requestInterceptorFn(mockConfig);

      // Assert - no auth header should be added with null token
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
        "Session expired"
      );
      expect(mockKeycloak.logout).toHaveBeenCalledWith({
        redirectUri: globalThis.location.origin,
      });
    });

    it("should redirect to origin on logout to prevent open redirect", async () => {
      // Arrange
      mockKeycloak.updateToken.mockRejectedValue(new Error("Token expired"));

      await import("../../services/api");
      const requestInterceptorFn = mockRequestInterceptor.mock.calls[0][0];

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      // Act
      try {
        await requestInterceptorFn(mockConfig);
      } catch {
        // Expected to throw
      }

      // Assert - must use origin, not user-controlled redirect
      expect(mockKeycloak.logout).toHaveBeenCalledWith({
        redirectUri: "https://test.local",
      });
    });
  });

  describe("token validity configuration", () => {
    it("should use a positive validity buffer to prevent mid-request expiration", async () => {
      // Act
      const { TOKEN_MIN_VALIDITY } = await import("../../services/api");

      // Assert - buffer must be positive to provide safety margin
      expect(TOKEN_MIN_VALIDITY).toBeGreaterThan(0);
    });

    it("should use a reasonable validity buffer (between 10-60 seconds)", async () => {
      // Act
      const { TOKEN_MIN_VALIDITY } = await import("../../services/api");

      // Assert - too short risks expiration, too long causes unnecessary refreshes
      expect(TOKEN_MIN_VALIDITY).toBeGreaterThanOrEqual(10);
      expect(TOKEN_MIN_VALIDITY).toBeLessThanOrEqual(60);
    });
  });

  describe("API methods", () => {
    it("should expose getProfile method for /contacts/me endpoint", async () => {
      // Arrange
      const { apiService } = await import("../../services/api");

      // Assert
      expect(apiService.getProfile).toBeTypeOf("function");
    });

    it("should expose updateProfile method for profile updates", async () => {
      // Arrange
      const { apiService } = await import("../../services/api");

      // Assert
      expect(apiService.updateProfile).toBeTypeOf("function");
    });
  });
});
