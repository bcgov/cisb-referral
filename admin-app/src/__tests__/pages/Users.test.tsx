import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Users } from "../../pages/Users";
import { UserRole, type User } from "../../types";

const { mockUseCurrentUser, mockApiService } = vi.hoisted(() => ({
  mockUseCurrentUser: vi.fn(),
  mockApiService: {
    fetchUsers: vi.fn(),
    updateUser: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

vi.mock("../../hooks", () => ({
  useCurrentUser: mockUseCurrentUser,
}));

vi.mock("../../services", () => ({
  apiService: mockApiService,
}));

vi.mock("../../components/ui", async () => {
  const actual = await vi.importActual<typeof import("../../components/ui")>(
    "../../components/ui",
  );

  return {
    ...actual,
    Dialog: ({
      open,
      title,
      children,
    }: {
      open: boolean;
      title: string;
      children: ReactNode;
    }) =>
      open ? (
        <dialog open aria-label={title}>
          {children}
        </dialog>
      ) : null,
  };
});

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "admin-1",
    fullName: "Current Admin",
    email: "admin@test.com",
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: "2026-05-14T00:00:00.000Z",
    updatedAt: "2026-05-14T00:00:00.000Z",
    ...overrides,
  };
}

function renderUsersPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>,
  );
}

describe("Users page RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCurrentUser.mockReturnValue({
      currentUser: buildUser(),
      isLoading: false,
      isSystemAdmin: false,
      isForbidden: false,
    });

    mockApiService.fetchUsers.mockResolvedValue([buildUser()]);
    mockApiService.updateUser.mockResolvedValue(buildUser());
    mockApiService.createUser.mockResolvedValue(buildUser({ id: "user-2" }));
    mockApiService.deleteUser.mockResolvedValue(buildUser({ isActive: false }));
  });

  it("locks role selection for self-edit and omits role in update payload", async () => {
    renderUsersPage();

    const editButton = await screen.findByRole("button", { name: "Edit" });
    fireEvent.click(editButton);

    const roleSelect = await screen.findByLabelText(/role/i);
    expect(roleSelect).toBeDisabled();
    expect(
      screen.getByText("You cannot change your own role."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockApiService.updateUser).toHaveBeenCalledTimes(1);
    });

    expect(mockApiService.updateUser).toHaveBeenCalledWith("admin-1", {
      fullName: "Current Admin",
      email: "admin@test.com",
    });

    const updatePayload = (mockApiService.updateUser as Mock).mock.calls[0][1];
    expect(updatePayload).not.toHaveProperty("role");
  });
});
