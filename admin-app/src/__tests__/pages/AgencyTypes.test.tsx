import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AgencyTypes } from "../../pages/AgencyTypes";
import { UserRole } from "../../types";
import type { AgencyType } from "../../types";

const { mockUseCurrentUser, mockApiService } = vi.hoisted(() => ({
  mockUseCurrentUser: vi.fn(),
  mockApiService: {
    fetchAgencyTypes: vi.fn(),
  },
}));

vi.mock("../../hooks", () => ({
  useCurrentUser: mockUseCurrentUser,
}));

vi.mock("../../services", () => ({
  apiService: mockApiService,
}));

const testAgencyType: AgencyType = {
  id: "agency-1",
  name: "Non-Profit",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderAgencyTypes() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AgencyTypes />
    </QueryClientProvider>,
  );
}

describe("AgencyTypes page RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiService.fetchAgencyTypes.mockResolvedValue([testAgencyType]);
  });

  it("hides add/edit/delete controls for USER role", async () => {
    mockUseCurrentUser.mockReturnValue({
      currentUser: { id: "user-1", role: UserRole.USER },
      isLoading: false,
    });

    renderAgencyTypes();

    expect(
      screen.queryByRole("button", { name: "Add Agency Type" }),
    ).not.toBeInTheDocument();

    await screen.findByText("Non-Profit");

    // EditableCell's Edit button should not be rendered
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    // Table's Delete button should not be rendered
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

      renderAgencyTypes();

      expect(
        screen.getByRole("button", { name: "Add Agency Type" }),
      ).toBeInTheDocument();

      await screen.findByText("Non-Profit");

      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" }),
      ).toBeInTheDocument();
    },
  );
});
