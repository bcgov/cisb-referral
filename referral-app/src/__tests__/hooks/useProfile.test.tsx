import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock the API service
const mockGetProfile = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock("../../services", () => ({
  apiService: {
    getProfile: () => mockGetProfile(),
    updateProfile: (data: { phone: string }) => mockUpdateProfile(data),
  },
}));

// Import after mocking
import { useProfile, useUpdateProfile, PROFILE_QUERY_KEY } from "../../hooks/useProfile";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProfile hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should start in loading state", () => {
      // Arrange
      mockGetProfile.mockReturnValue(new Promise(() => {})); // Never resolves

      // Act
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Assert
      expect(result.current.isLoading).toBe(true);
      expect(result.current.profile).toBeNull();
    });
  });

  describe("successful profile fetch", () => {
    it("should return profile data when fetch succeeds", async () => {
      // Arrange
      const mockProfileData = {
        contact: {
          id: "123",
          fullName: "Test User",
          email: "test@test.com",
          phone: "1234567890",
          userName: "testuser",
        },
        isProfileComplete: true,
      };
      mockGetProfile.mockResolvedValue(mockProfileData);

      // Act
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.profile).toEqual(mockProfileData.contact);
      expect(result.current.isProfileComplete).toBe(true);
    });

    it("should extract contact from nested response structure", async () => {
      // Arrange
      const mockProfileData = {
        contact: {
          id: "123",
          fullName: "Test User",
          email: "test@test.com",
          phone: null,
          userName: "testuser",
        },
        isProfileComplete: false,
      };
      mockGetProfile.mockResolvedValue(mockProfileData);

      // Act
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.profile?.fullName).toBe("Test User");
      });
    });
  });

  describe("profile completion status", () => {
    it("should return isProfileComplete: false when phone is missing", async () => {
      // Arrange
      const mockProfileData = {
        contact: {
          id: "123",
          fullName: "Test User",
          email: "test@test.com",
          phone: null,
          userName: "testuser",
        },
        isProfileComplete: false,
      };
      mockGetProfile.mockResolvedValue(mockProfileData);

      // Act
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isProfileComplete).toBe(false);
      });
    });

    it("should return isProfileComplete: true when profile has phone", async () => {
      // Arrange
      const mockProfileData = {
        contact: {
          id: "123",
          fullName: "Test User",
          email: "test@test.com",
          phone: "1234567890",
          userName: "testuser",
        },
        isProfileComplete: true,
      };
      mockGetProfile.mockResolvedValue(mockProfileData);

      // Act
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isProfileComplete).toBe(true);
      });
    });
  });

  describe("error handling", () => {
    it("should return error message when fetch fails", async () => {
      // Arrange
      mockGetProfile.mockRejectedValue(new Error("Network error"));

      // Act
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Failed to load profile");
      });
    });

    it("should return null profile on error", async () => {
      // Arrange
      mockGetProfile.mockRejectedValue(new Error("Unauthorized"));

      // Act
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.profile).toBeNull();
      });
    });
  });
});

describe("useUpdateProfile hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mutation function", () => {
    it("should call updateProfile with phone data", async () => {
      // Arrange
      mockUpdateProfile.mockResolvedValue({
        contact: { id: "123", phone: "1234567890" },
        isProfileComplete: true,
      });

      // Act
      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ phone: "1234567890" });

      // Assert
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ phone: "1234567890" });
      });
    });
  });

  describe("cache invalidation", () => {
    it("should invalidate profile query on success", async () => {
      // Arrange
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      mockUpdateProfile.mockResolvedValue({
        contact: { id: "123", phone: "1234567890" },
        isProfileComplete: true,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      // Act
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      result.current.mutate({ phone: "1234567890" });

      // Assert
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: PROFILE_QUERY_KEY,
        });
      });
    });
  });
});

describe("PROFILE_QUERY_KEY", () => {
  it("should be a readonly array for cache key consistency", async () => {
    // Act
    const { PROFILE_QUERY_KEY } = await import("../../hooks/useProfile");

    // Assert
    expect(Array.isArray(PROFILE_QUERY_KEY)).toBe(true);
    expect(PROFILE_QUERY_KEY).toContain("profile");
  });
});
