import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Auth module security configuration constants
 * Must match the values in src/auth/index.ts
 */
const AUTH_CONFIG = {
  onLoad: "login-required",
  checkLoginIframe: false,
  pkceMethod: "S256",
} as const;

const TOKEN_REFRESH_BUFFER_SECONDS = 30;

// Factory for creating mock keycloak instance
const createMockKeycloakInstance = () => ({
  init: vi.fn(),
  logout: vi.fn(),
  updateToken: vi.fn(),
  authenticated: false,
  token: null as string | null,
  tokenParsed: null as Record<string, unknown> | null,
  onTokenExpired: null as (() => void) | null,
});

let mockKeycloakInstance = createMockKeycloakInstance();

// Mock keycloak-js before importing auth module
vi.mock("keycloak-js", () => {
  return {
    default: function MockKeycloak() {
      return mockKeycloakInstance;
    },
  };
});

describe("auth module", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Reset mock instance
    mockKeycloakInstance = createMockKeycloakInstance();
  });

  describe("init", () => {
    it("should initialize Keycloak with secure configuration", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Assert - verify security-critical configuration
      expect(mockKeycloakInstance.init).toHaveBeenCalledWith(AUTH_CONFIG);
    });

    it("should use PKCE S256 for OAuth security", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Assert - PKCE S256 is critical for preventing authorization code interception
      const initCall = mockKeycloakInstance.init.mock.calls[0][0];
      expect(initCall.pkceMethod).toBe("S256");
    });

    it("should require login on load for protected routes", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Assert - login-required ensures no unauthenticated access
      const initCall = mockKeycloakInstance.init.mock.calls[0][0];
      expect(initCall.onLoad).toBe("login-required");
    });

    it("should disable login iframe to prevent clickjacking", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Assert - disabled iframe prevents silent session checks that can be exploited
      const initCall = mockKeycloakInstance.init.mock.calls[0][0];
      expect(initCall.checkLoginIframe).toBe(false);
    });

    it("should resolve when authentication succeeds", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");

      // Assert - should resolve without throwing
      await expect(init()).resolves.toBeUndefined();
    });

    it("should propagate init errors", async () => {
      // Arrange
      mockKeycloakInstance.init.mockRejectedValue(new Error("Init failed"));

      // Act
      const { init } = await import("../../auth/index");

      // Assert - should propagate the error
      await expect(init()).rejects.toThrow("Init failed");
    });

    it("should set up token expiry handler", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Assert - onTokenExpired should be set for automatic refresh
      expect(mockKeycloakInstance.onTokenExpired).toBeTypeOf("function");
    });

    it("should attempt token refresh when token expires", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      mockKeycloakInstance.updateToken.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Trigger token expiry
      mockKeycloakInstance.onTokenExpired!();

      // Assert
      expect(mockKeycloakInstance.updateToken).toHaveBeenCalledWith(
        TOKEN_REFRESH_BUFFER_SECONDS,
      );
    });

    it("should logout when token refresh fails on expiry", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      mockKeycloakInstance.updateToken.mockRejectedValue(
        new Error("Refresh failed"),
      );

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Trigger token expiry
      mockKeycloakInstance.onTokenExpired!();

      // Assert - should logout on refresh failure
      await vi.waitFor(() => {
        expect(mockKeycloakInstance.logout).toHaveBeenCalledWith({
          redirectUri: globalThis.location.origin,
        });
      });
    });
  });

  describe("logout", () => {
    it("should call keycloak logout with redirect to origin", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { logout } = await import("../../auth/index");
      logout();

      // Assert - redirect prevents open redirect vulnerabilities
      expect(mockKeycloakInstance.logout).toHaveBeenCalledWith({
        redirectUri: globalThis.location.origin,
      });
    });

    it("should redirect to same origin only to prevent open redirect attacks", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { logout } = await import("../../auth/index");
      logout();

      // Assert - using location.origin ensures we only redirect to our own domain
      const logoutCall = mockKeycloakInstance.logout.mock.calls[0][0];
      expect(logoutCall.redirectUri).toBe("https://test.local");
    });
  });
});
