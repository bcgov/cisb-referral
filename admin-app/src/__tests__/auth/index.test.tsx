import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

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

    it("should set up token expiry handler that refreshes token", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      mockKeycloakInstance.updateToken.mockResolvedValue(true);

      // Act
      const { init } = await import("../../auth/index");
      await init();

      // Assert - onTokenExpired should be set for automatic refresh
      expect(mockKeycloakInstance.onTokenExpired).toBeTypeOf("function");

      // Trigger token expiry
      mockKeycloakInstance.onTokenExpired!();

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

  describe("AuthProvider", () => {
    it("should render children after auth initializes", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      const AuthProvider = (await import("../../auth/index")).default;

      // Act
      await act(async () => {
        render(
          <AuthProvider>
            <div data-testid="child">Protected Content</div>
          </AuthProvider>,
        );
      });

      // Assert
      expect(screen.getByTestId("child")).toHaveTextContent(
        "Protected Content",
      );
    });

    it("should show fallback while auth is pending", async () => {
      // Arrange
      mockKeycloakInstance.init.mockImplementation(() => new Promise(() => {}));
      const AuthProvider = (await import("../../auth/index")).default;

      // Act
      render(
        <AuthProvider>
          <div data-testid="child">Protected Content</div>
        </AuthProvider>,
      );

      // Assert - child should not be rendered while suspended
      expect(screen.queryByTestId("child")).toBeNull();
    });

    it("should only call init once across multiple renders", async () => {
      // Arrange
      mockKeycloakInstance.init.mockResolvedValue(true);
      const AuthProvider = (await import("../../auth/index")).default;

      // Act
      const { unmount } = await act(async () =>
        render(
          <AuthProvider>
            <div>First</div>
          </AuthProvider>,
        ),
      );

      expect(screen.getByText("First")).toBeInTheDocument();

      unmount();

      await act(async () => {
        render(
          <AuthProvider>
            <div>Second</div>
          </AuthProvider>,
        );
      });

      expect(screen.getByText("Second")).toBeInTheDocument();

      // Assert - init should only be called once due to promise caching
      expect(mockKeycloakInstance.init).toHaveBeenCalledTimes(1);
    });
  });
});
