import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Regions } from "../../pages/Regions";
import { UserRole } from "../../types";
import type { Region } from "../../types";

const { mockUseCurrentUser, mockApiService } = vi.hoisted(() => ({
  mockUseCurrentUser: vi.fn(),
  mockApiService: {
    fetchRegions: vi.fn(),
  },
}));

vi.mock("../../hooks", () => ({
  useCurrentUser: mockUseCurrentUser,
}));

vi.mock("../../services", () => ({
  apiService: mockApiService,
}));

const testRegion: Region = {
  id: "region-1",
  name: "Vancouver Island",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderRegions() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Regions />
    </QueryClientProvider>,
  );
}

describe("Regions page RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiService.fetchRegions.mockResolvedValue([testRegion]);
  });

  it("hides add/edit/delete controls for USER role", async () => {
    mockUseCurrentUser.mockReturnValue({
      currentUser: { id: "user-1", role: UserRole.USER },
      isLoading: false,
    });

    renderRegions();

    expect(
      screen.queryByRole("button", { name: "Add Region" }),
    ).not.toBeInTheDocument();

    await screen.findByText("Vancouver Island");

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it.each([UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR])(
    "shows add/edit/delete controls for %s role",
    async (role) => {
      mockUseCurrentUser.mockReturnValue({
        currentUser: { id: "admin-1", role },
        isLoading: false,
      });

      renderRegions();

      expect(
        screen.getByRole("button", { name: "Add Region" }),
      ).toBeInTheDocument();

      await screen.findByText("Vancouver Island");

      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" }),
      ).toBeInTheDocument();
    },
  );
});
