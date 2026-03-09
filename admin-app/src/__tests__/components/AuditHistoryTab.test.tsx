import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuditHistoryTab } from "../../components/referral";
import type { AuditLogEntry } from "../../types";

// Mock the auth module (required by api service)
vi.mock("../../auth", () => ({
  keycloak: {
    updateToken: vi.fn().mockResolvedValue(true),
    token: "mock-token",
  },
}));

const mockFetchAuditLog = vi.fn();

vi.mock("../../services", () => ({
  apiService: {
    fetchAuditLog: (...args: unknown[]) => mockFetchAuditLog(...args),
  },
}));

/**
 * Factory for creating a test audit log entry with dynamic defaults
 */
const createTestAuditEntry = (
  overrides: Partial<AuditLogEntry> = {},
): AuditLogEntry => ({
  id: crypto.randomUUID(),
  referralId: crypto.randomUUID(),
  action: "UPDATE",
  fieldChanged: "referralStatus",
  oldValue: "OPEN",
  newValue: "ASSIGNED",
  comment: null,
  changedBy: "admin@gov.bc.ca",
  changedAt: "2025-06-15T14:30:00.000Z",
  ...overrides,
});

/**
 * Create a QueryClient configured for testing (no retries, no refetch)
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

/**
 * Render with QueryClientProvider wrapper
 */
function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("AuditHistoryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    // Arrange
    mockFetchAuditLog.mockReturnValue(new Promise(() => {}));

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    expect(screen.getByText("Loading audit history...")).toBeInTheDocument();
  });

  it("should show empty state when no audit entries exist", async () => {
    // Arrange
    mockFetchAuditLog.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("No audit history available."),
      ).toBeInTheDocument();
    });
  });

  it("should render audit log entries with correct field labels", async () => {
    // Arrange
    const entries = [
      createTestAuditEntry({
        fieldChanged: "referralStatus",
        oldValue: "OPEN",
        newValue: "ASSIGNED",
        changedBy: "jane.smith@gov.bc.ca",
      }),
      createTestAuditEntry({
        fieldChanged: "specificCityTown",
        oldValue: "Victoria",
        newValue: "Vancouver",
        changedBy: "bob.lee@gov.bc.ca",
      }),
    ];
    mockFetchAuditLog.mockResolvedValue({
      data: entries,
      meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("City/Town")).toBeInTheDocument();
      expect(screen.getByText("jane.smith@gov.bc.ca")).toBeInTheDocument();
      expect(screen.getByText("bob.lee@gov.bc.ca")).toBeInTheDocument();
    });
  });

  it("should show em dash for null values", async () => {
    // Arrange
    const entries = [
      createTestAuditEntry({
        fieldChanged: "assignedTo",
        oldValue: null,
        newValue: "John Doe",
      }),
    ];
    mockFetchAuditLog.mockResolvedValue({
      data: entries,
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Assigned To")).toBeInTheDocument();
      const cells = screen.getAllByRole("cell");
      const oldValueCell = cells.find((cell) => cell.textContent === "—");
      expect(oldValueCell).toBeInTheDocument();
    });
  });

  it("should show error state when fetch fails", async () => {
    // Arrange
    mockFetchAuditLog.mockRejectedValue(new Error("Network error"));

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load audit history."),
      ).toBeInTheDocument();
    });
  });

  it("should show em dash when changedBy is empty", async () => {
    // Arrange
    const entries = [
      createTestAuditEntry({
        changedBy: "",
      }),
    ];
    mockFetchAuditLog.mockResolvedValue({
      data: entries,
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    await waitFor(() => {
      const cells = screen.getAllByRole("cell");
      const changedByCell = cells[5];
      expect(changedByCell.textContent).toBe("—");
    });
  });

  it("should display the system administrator notice", async () => {
    // Arrange
    mockFetchAuditLog.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    expect(
      screen.getByText(
        "This section is only visible to system administrators.",
      ),
    ).toBeInTheDocument();
  });

  it("should display formatted date/time for entries", async () => {
    // Arrange
    const entries = [
      createTestAuditEntry({
        changedAt: "2025-06-15T14:30:00.000Z",
      }),
    ];
    mockFetchAuditLog.mockResolvedValue({
      data: entries,
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    await waitFor(() => {
      const cells = screen.getAllByRole("cell");
      const dateCell = cells[0];
      expect(dateCell.textContent).toContain("2025");
      expect(dateCell.textContent).toContain("Jun");
    });
  });

  it("should call fetchAuditLog with the provided referralId", async () => {
    // Arrange
    const referralId = crypto.randomUUID();
    mockFetchAuditLog.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={referralId} />);

    // Assert
    await waitFor(() => {
      expect(mockFetchAuditLog).toHaveBeenCalledWith(referralId);
    });
  });

  it("should auto-derive label from camelCase for unmapped fields", async () => {
    // Arrange
    const entries = [
      createTestAuditEntry({
        fieldChanged: "someUnknownField",
        oldValue: "old",
        newValue: "new",
      }),
    ];
    mockFetchAuditLog.mockResolvedValue({
      data: entries,
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });

    // Act
    renderWithQuery(<AuditHistoryTab referralId={crypto.randomUUID()} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Some Unknown Field")).toBeInTheDocument();
    });
  });
});
