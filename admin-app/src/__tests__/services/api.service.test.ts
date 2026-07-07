import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserRole } from "../../types";

// Mock the auth module before importing api service
const mockKeycloak = {
  updateToken: vi.fn(),
  logout: vi.fn(),
  token: null as string | null,
};

vi.mock("../../auth", () => ({
  keycloak: mockKeycloak,
}));

// Hoisted mock client methods so tests can set return values
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: () => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: mockGet,
      post: mockPost,
      put: mockPut,
      patch: mockPatch,
      delete: mockDelete,
    }),
  },
}));

describe("APIService methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("referrals", () => {
    it("should fetch referrals with params", async () => {
      // Arrange
      const mockData = { data: [{ id: "1" }], total: 1 };
      mockGet.mockResolvedValue({ data: mockData });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchReferrals({ page: 1, limit: 10 });

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/referrals", {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockData);
    });

    it("should fetch referrals with default empty params", async () => {
      // Arrange
      const mockData = { data: [], total: 0 };
      mockGet.mockResolvedValue({ data: mockData });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchReferrals();

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/referrals", { params: {} });
      expect(result).toEqual(mockData);
    });

    it("should fetch referrals with search param", async () => {
      // Arrange
      const mockData = { data: [{ id: "1" }], total: 1 };
      mockGet.mockResolvedValue({ data: mockData });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchReferrals({
        page: 1,
        limit: 25,
        search: "Jane",
      });

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/referrals", {
        params: { page: 1, limit: 25, search: "Jane" },
      });
      expect(result).toEqual(mockData);
    });

    it("should fetch referrals for export with metadata", async () => {
      // Arrange
      const mockData = {
        data: [{ id: "1" }],
        meta: {
          total: 2,
          exported: 1,
          truncated: true,
          maxRows: 10000,
        },
      };
      mockGet.mockResolvedValue({ data: mockData });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchReferralsForExport({
        search: "Jane",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/referrals/export", {
        params: {
          search: "Jane",
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      expect(result).toEqual(mockData);
    });

    it("should fetch a single referral by id", async () => {
      // Arrange
      const mockReferral = { id: "abc-123" };
      mockGet.mockResolvedValue({ data: mockReferral });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchReferral("abc-123");

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/referrals/abc-123");
      expect(result).toEqual(mockReferral);
    });

    it("should update a referral", async () => {
      // Arrange
      const updateData = { referralStatus: "ASSIGNED" as const };
      const mockReferral = { id: "abc-123", referralStatus: "ASSIGNED" };
      mockPatch.mockResolvedValue({ data: mockReferral });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.updateReferral("abc-123", updateData);

      // Assert
      expect(mockPatch).toHaveBeenCalledWith("/referrals/abc-123", updateData);
      expect(result).toEqual(mockReferral);
    });
  });

  describe("regions", () => {
    it("should fetch regions", async () => {
      // Arrange
      const mockRegions = [{ id: "1", name: "Region A" }];
      mockGet.mockResolvedValue({ data: mockRegions });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchRegions();

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/regions");
      expect(result).toEqual(mockRegions);
    });

    it("should create a region", async () => {
      // Arrange
      const createData = { name: "New Region" };
      const mockRegion = { id: "1", name: "New Region" };
      mockPost.mockResolvedValue({ data: mockRegion });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.createRegion(createData);

      // Assert
      expect(mockPost).toHaveBeenCalledWith("/regions", createData);
      expect(result).toEqual(mockRegion);
    });

    it("should update a region", async () => {
      // Arrange
      const updateData = { name: "Updated Region" };
      const mockRegion = { id: "1", name: "Updated Region" };
      mockPut.mockResolvedValue({ data: mockRegion });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.updateRegion("1", updateData);

      // Assert
      expect(mockPut).toHaveBeenCalledWith("/regions/1", updateData);
      expect(result).toEqual(mockRegion);
    });

    it("should delete a region", async () => {
      // Arrange
      mockDelete.mockResolvedValue({});
      const { apiService } = await import("../../services/api");

      // Act
      await apiService.deleteRegion("1");

      // Assert
      expect(mockDelete).toHaveBeenCalledWith("/regions/1");
    });
  });

  describe("ministries", () => {
    it("should fetch ministries", async () => {
      // Arrange
      const mockMinistries = [{ id: "1", name: "Ministry A" }];
      mockGet.mockResolvedValue({ data: mockMinistries });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchMinistries();

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/ministries");
      expect(result).toEqual(mockMinistries);
    });

    it("should create a ministry", async () => {
      // Arrange
      const createData = { name: "New Ministry" };
      const mockMinistry = { id: "1", name: "New Ministry" };
      mockPost.mockResolvedValue({ data: mockMinistry });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.createMinistry(createData);

      // Assert
      expect(mockPost).toHaveBeenCalledWith("/ministries", createData);
      expect(result).toEqual(mockMinistry);
    });

    it("should update a ministry", async () => {
      // Arrange
      const updateData = { name: "Updated Ministry" };
      const mockMinistry = { id: "1", name: "Updated Ministry" };
      mockPut.mockResolvedValue({ data: mockMinistry });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.updateMinistry("1", updateData);

      // Assert
      expect(mockPut).toHaveBeenCalledWith("/ministries/1", updateData);
      expect(result).toEqual(mockMinistry);
    });

    it("should delete a ministry", async () => {
      // Arrange
      mockDelete.mockResolvedValue({});
      const { apiService } = await import("../../services/api");

      // Act
      await apiService.deleteMinistry("1");

      // Assert
      expect(mockDelete).toHaveBeenCalledWith("/ministries/1");
    });
  });

  describe("agency types", () => {
    it("should fetch agency types", async () => {
      // Arrange
      const mockTypes = [{ id: "1", name: "Type A" }];
      mockGet.mockResolvedValue({ data: mockTypes });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchAgencyTypes();

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/agency-types");
      expect(result).toEqual(mockTypes);
    });

    it("should create an agency type", async () => {
      // Arrange
      const createData = { name: "New Type" };
      const mockType = { id: "1", name: "New Type" };
      mockPost.mockResolvedValue({ data: mockType });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.createAgencyType(createData);

      // Assert
      expect(mockPost).toHaveBeenCalledWith("/agency-types", createData);
      expect(result).toEqual(mockType);
    });

    it("should update an agency type", async () => {
      // Arrange
      const updateData = { name: "Updated Type" };
      const mockType = { id: "1", name: "Updated Type" };
      mockPut.mockResolvedValue({ data: mockType });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.updateAgencyType("1", updateData);

      // Assert
      expect(mockPut).toHaveBeenCalledWith("/agency-types/1", updateData);
      expect(result).toEqual(mockType);
    });

    it("should delete an agency type", async () => {
      // Arrange
      mockDelete.mockResolvedValue({});
      const { apiService } = await import("../../services/api");

      // Act
      await apiService.deleteAgencyType("1");

      // Assert
      expect(mockDelete).toHaveBeenCalledWith("/agency-types/1");
    });
  });

  describe("users", () => {
    it("should fetch the current user", async () => {
      // Arrange
      const mockUser = { id: "1", fullName: "Test User", role: "ADMIN" };
      mockGet.mockResolvedValue({ data: mockUser });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchCurrentUser();

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(mockUser);
    });

    it("should fetch users without filters", async () => {
      // Arrange
      const mockUsers = [{ id: "1", name: "User A" }];
      mockGet.mockResolvedValue({ data: mockUsers });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchUsers();

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/users", { params: {} });
      expect(result).toEqual(mockUsers);
    });

    it("should fetch users with role filter", async () => {
      // Arrange
      const mockUsers = [{ id: "1", role: "ADMIN" }];
      mockGet.mockResolvedValue({ data: mockUsers });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchUsers(UserRole.ADMIN);

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/users", {
        params: { role: "ADMIN" },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should fetch users with isActive filter", async () => {
      // Arrange
      const mockUsers = [{ id: "1", isActive: true }];
      mockGet.mockResolvedValue({ data: mockUsers });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchUsers(undefined, true);

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/users", {
        params: { isActive: "true" },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should fetch assignable users", async () => {
      // Arrange
      const mockUsers = [{ id: "1", name: "User A", isActive: true }];
      mockGet.mockResolvedValue({ data: mockUsers });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.fetchAssignableUsers();

      // Assert
      expect(mockGet).toHaveBeenCalledWith("/users/assignees");
      expect(result).toEqual(mockUsers);
    });

    it("should create a user", async () => {
      // Arrange
      const createData = { email: "user@gov.bc.ca", name: "New User" };
      const mockUser = { id: "1", ...createData };
      mockPost.mockResolvedValue({ data: mockUser });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.createUser(createData as never);

      // Assert
      expect(mockPost).toHaveBeenCalledWith("/users", createData);
      expect(result).toEqual(mockUser);
    });

    it("should update a user", async () => {
      // Arrange
      const updateData = { name: "Updated User" };
      const mockUser = { id: "1", name: "Updated User" };
      mockPatch.mockResolvedValue({ data: mockUser });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.updateUser("1", updateData as never);

      // Assert
      expect(mockPatch).toHaveBeenCalledWith("/users/1", updateData);
      expect(result).toEqual(mockUser);
    });

    it("should delete a user", async () => {
      // Arrange
      const mockUser = { id: "1", name: "Deleted User" };
      mockDelete.mockResolvedValue({ data: mockUser });
      const { apiService } = await import("../../services/api");

      // Act
      const result = await apiService.deleteUser("1");

      // Assert
      expect(mockDelete).toHaveBeenCalledWith("/users/1");
      expect(result).toEqual(mockUser);
    });
  });
});
