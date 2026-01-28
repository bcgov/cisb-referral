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

// Factory for creating mock token payload
const createMockTokenParsed = (overrides = {}) => ({
  sub: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  preferred_username: "testuser",
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  ...overrides,
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
      const onSuccess = vi.fn();

      // Act
      const { init } = await import("../../auth/index");
      init(onSuccess);

      // Assert - verify security-critical configuration
      await vi.waitFor(() => {
        expect(mockKeycloakInstance.init).toHaveBeenCalledWith(AUTH_CONFIG);
      });
    });

    it("should use PKCE S256 for OAuth security", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      init(vi.fn());

      // Assert - PKCE S256 is critical for preventing authorization code interception
      await vi.waitFor(() => {
        const initCall = mockKeycloakInstance.init.mock.calls[0][0];
        expect(initCall.pkceMethod).toBe("S256");
      });
    });

    it("should require login on load for protected routes", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      init(vi.fn());

      // Assert - login-required ensures no unauthenticated access
      await vi.waitFor(() => {
        const initCall = mockKeycloakInstance.init.mock.calls[0][0];
        expect(initCall.onLoad).toBe("login-required");
      });
    });

    it("should disable login iframe to prevent clickjacking", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      init(vi.fn());

      // Assert - disabled iframe prevents silent session checks that can be exploited
      await vi.waitFor(() => {
        const initCall = mockKeycloakInstance.init.mock.calls[0][0];
        expect(initCall.checkLoginIframe).toBe(false);
      });
    });

    it("should call onSuccess callback when authentication succeeds", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      const onSuccess = vi.fn();

      // Act
      const { init } = await import("../../auth/index");
      init(onSuccess);

      // Assert
      await vi.waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should not call onSuccess when authentication fails", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(false);
      const onSuccess = vi.fn();

      // Act
      const { init } = await import("../../auth/index");
      init(onSuccess);

      // Assert - wait a tick then verify not called
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should handle init failure gracefully without logging", async () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockKeycloakInstance.init.mockRejectedValue(new Error("Init failed"));
      const onSuccess = vi.fn();

      // Act
      const { init } = await import("../../auth/index");
      init(onSuccess);

      // Assert - no console logging, no crash
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should set up token expiry handler that refreshes token", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      mockKeycloakInstance.updateToken.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      init(vi.fn());

      // Assert - token expiry handler should be set
      await vi.waitFor(() => {
        expect(mockKeycloakInstance.onTokenExpired).toBeDefined();
      });

      // Trigger token expiry
      mockKeycloakInstance.onTokenExpired?.();

      await vi.waitFor(() => {
        expect(mockKeycloakInstance.updateToken).toHaveBeenCalledWith(
          TOKEN_REFRESH_BUFFER_SECONDS,
        );
      });
    });

    it("should logout when token refresh fails on expiry", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      mockKeycloakInstance.updateToken.mockRejectedValue(
        new Error("Refresh failed"),
      );

      // Act
      const { init } = await import("../../auth/index");
      init(vi.fn());

      await vi.waitFor(() => {
        expect(mockKeycloakInstance.onTokenExpired).toBeDefined();
      });

      // Trigger token expiry
      mockKeycloakInstance.onTokenExpired?.();

      // Assert - must redirect to dynamic origin to prevent open redirect attacks
      await vi.waitFor(() => {
        expect(mockKeycloakInstance.logout).toHaveBeenCalledWith({
          redirectUri: globalThis.location.origin,
        });
      });
    });
  });

  describe("logout", () => {
    it("should call Keycloak logout with redirect to current origin", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { logout } = await import("../../auth/index");
      logout();

      // Assert
      expect(mockKeycloakInstance.logout).toHaveBeenCalledWith({
        redirectUri: globalThis.location.origin,
      });
    });
  });

  describe("getUser", () => {
    it("should return null when not authenticated", async () => {
      // Arrange
      mockKeycloakInstance.authenticated = false;
      mockKeycloakInstance.init.mockResolvedValue(false);

      // Act
      const { getUser } = await import("../../auth/index");
      const result = getUser();

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when tokenParsed is null", async () => {
      // Arrange
      mockKeycloakInstance.authenticated = true;
      mockKeycloakInstance.tokenParsed = null;
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { getUser } = await import("../../auth/index");
      const result = getUser();

      // Assert
      expect(result).toBeNull();
    });

    it("should return user info when authenticated with valid token", async () => {
      // Arrange
      const tokenPayload = createMockTokenParsed({
        sub: "user-123",
        email: "admin@gov.bc.ca",
        name: "Admin User",
      });
      mockKeycloakInstance.authenticated = true;
      mockKeycloakInstance.tokenParsed = tokenPayload;
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { getUser } = await import("../../auth/index");
      const result = getUser();

      // Assert
      expect(result).toEqual({
        id: "user-123",
        email: "admin@gov.bc.ca",
        name: "Admin User",
      });
    });

    it("should fall back to preferred_username when name is missing", async () => {
      // Arrange
      const tokenPayload = createMockTokenParsed({
        sub: "user-456",
        email: "user@gov.bc.ca",
        name: undefined,
        preferred_username: "jsmith",
      });
      mockKeycloakInstance.authenticated = true;
      mockKeycloakInstance.tokenParsed = tokenPayload;
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { getUser } = await import("../../auth/index");
      const result = getUser();

      // Assert
      expect(result).toEqual({
        id: "user-456",
        email: "user@gov.bc.ca",
        name: "jsmith",
      });
    });

    it("should return empty strings for missing token fields", async () => {
      // Arrange
      const tokenPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };
      mockKeycloakInstance.authenticated = true;
      mockKeycloakInstance.tokenParsed = tokenPayload;
      mockKeycloakInstance.init.mockResolvedValue(true);

      // Act
      const { getUser } = await import("../../auth/index");
      const result = getUser();

      // Assert
      expect(result).toEqual({
        id: "",
        email: "",
        name: "",
      });
    });
  });

  describe("keycloak export", () => {
    it("should export keycloak instance for direct access", async () => {
      // Act
      const { keycloak } = await import("../../auth/index");

      // Assert
      expect(keycloak).toBeDefined();
      expect(keycloak.init).toBeDefined();
      expect(keycloak.logout).toBeDefined();
    });
  });
});
