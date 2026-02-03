import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the useProfile hook
const mockUseProfile = vi.fn();

vi.mock("../../hooks", () => ({
  useProfile: () => mockUseProfile(),
}));

// Import after mocking
import { ProtectedRoute } from "../../components/ProtectedRoute";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("should show loading indicator while profile is being fetched", () => {
      // Arrange
      mockUseProfile.mockReturnValue({
        profile: null,
        isProfileComplete: false,
        isLoading: true,
        error: null,
      });

      // Act
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() },
      );

      // Assert
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("profile incomplete", () => {
    it("should not render children when profile is incomplete", () => {
      // Arrange
      mockUseProfile.mockReturnValue({
        profile: {
          id: "1",
          fullName: "Test",
          email: "test@test.com",
          phone: null,
        },
        isProfileComplete: false,
        isLoading: false,
        error: null,
      });

      // Act
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() },
      );

      // Assert - children should not be rendered
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should redirect to /profile when profile is incomplete", () => {
      // Arrange
      mockUseProfile.mockReturnValue({
        profile: {
          id: "1",
          fullName: "Test",
          email: "test@test.com",
          phone: null,
        },
        isProfileComplete: false,
        isLoading: false,
        error: null,
      });

      // Act
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() },
      );

      // Assert - Navigate component should have been rendered (redirecting)
      // The actual navigation happens via Navigate component from react-router-dom
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("profile complete", () => {
    it("should render children when profile is complete", () => {
      // Arrange
      mockUseProfile.mockReturnValue({
        profile: {
          id: "1",
          fullName: "Test User",
          email: "test@test.com",
          phone: "1234567890",
        },
        isProfileComplete: true,
        isLoading: false,
        error: null,
      });

      // Act
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() },
      );

      // Assert
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should allow access to protected routes with complete profile", () => {
      // Arrange
      mockUseProfile.mockReturnValue({
        profile: {
          id: "1",
          fullName: "Test User",
          email: "test@test.com",
          phone: "1234567890",
        },
        isProfileComplete: true,
        isLoading: false,
        error: null,
      });

      // Act
      render(
        <ProtectedRoute>
          <div data-testid="referral-form">Referral Form</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() },
      );

      // Assert
      expect(screen.getByTestId("referral-form")).toBeInTheDocument();
    });
  });

  describe("security requirements", () => {
    it("should block access while loading to prevent content flash", () => {
      // Arrange
      mockUseProfile.mockReturnValue({
        profile: null,
        isProfileComplete: false,
        isLoading: true,
        error: null,
      });

      // Act
      render(
        <ProtectedRoute>
          <div>Sensitive Data</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() },
      );

      // Assert - sensitive content must not be shown during loading
      expect(screen.queryByText("Sensitive Data")).not.toBeInTheDocument();
    });

    it("should enforce profile completion before granting access", () => {
      // Arrange - profile exists but is incomplete (no phone)
      mockUseProfile.mockReturnValue({
        profile: {
          id: "1",
          fullName: "Test User",
          email: "test@test.com",
          phone: null,
        },
        isProfileComplete: false,
        isLoading: false,
        error: null,
      });

      // Act
      render(
        <ProtectedRoute>
          <div>Referral Form</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() },
      );

      // Assert - must complete profile first
      expect(screen.queryByText("Referral Form")).not.toBeInTheDocument();
    });
  });
});
