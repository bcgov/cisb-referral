import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Referrals } from "../../pages/Referrals";
import type { Referral } from "../../types";

const { mockApiService, mockDownloadCsv } = vi.hoisted(() => ({
  mockApiService: {
    fetchReferrals: vi.fn(),
    fetchReferralsForExport: vi.fn(),
    fetchAdminColumns: vi.fn(),
    updateAdminColumns: vi.fn(),
  },
  mockDownloadCsv: vi.fn(),
}));

vi.mock("../../services", () => ({
  apiService: mockApiService,
}));

vi.mock("../../utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils")>();
  return {
    ...actual,
    downloadCsv: mockDownloadCsv,
  };
});

const testReferral = {
  id: "referral-1",
  flag: false,
  referralStatus: "OPEN",
  referralOutcome: null,
  referredBy: "SDPR_INTERNAL",
  referrerContactName: "Test Referrer",
  individualFirstName: "Alice",
  individualLastName: "Smith",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  region: { id: "region-1", name: "Vancouver Island" },
  specificCityTown: "Victoria",
  assignedTo: null,
} as Referral;

function renderReferrals() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Referrals />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("Referrals page export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      value: vi.fn(),
      writable: true,
    });
    mockApiService.fetchReferrals.mockResolvedValue({
      data: [testReferral],
      meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
    });
    mockApiService.fetchAdminColumns.mockResolvedValue([
      "flag",
      "createdAt",
      "individualFirstName",
    ]);
    mockApiService.updateAdminColumns.mockResolvedValue([
      "flag",
      "createdAt",
      "individualFirstName",
    ]);
    mockApiService.fetchReferralsForExport.mockResolvedValue({
      data: [testReferral],
      meta: {
        total: 2,
        exported: 1,
        truncated: true,
        maxRows: 10000,
      },
    });
  });

  it("shows a warning when an export is truncated", async () => {
    renderReferrals();

    await screen.findByText("Alice");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    });

    expect(
      await screen.findByText(/Exported first 1 of 2 referrals/),
    ).toHaveTextContent("Exported first 1 of 2 referrals");
    expect(mockDownloadCsv).toHaveBeenCalledOnce();
  });

  it("passes trimmed keyword search to the API", async () => {
    renderReferrals();

    await screen.findByText("Alice");
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Filter by keyword"), {
        target: { value: "  smith  " },
      });
      fireEvent.keyDown(screen.getByPlaceholderText("Filter by keyword"), {
        key: "Enter",
      });
    });

    await waitFor(() =>
      expect(mockApiService.fetchReferrals).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "smith", page: 1 }),
      ),
    );
  });

  it("passes sort params to the API from a column header menu", async () => {
    renderReferrals();

    await screen.findByText("Alice");
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Open options for First Name"));
    });
    await act(async () => {
      fireEvent.click(await screen.findByText("Z to A"));
    });

    await waitFor(() =>
      expect(mockApiService.fetchReferrals).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: "individualFirstName",
          sortOrder: "desc",
          page: 1,
        }),
      ),
    );
  });

  it("passes filter params to the API from a column header menu", async () => {
    renderReferrals();

    await screen.findByText("Alice");
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Open options for First Name"));
    });
    fireEvent.click(screen.getByText("Filter by"));
    fireEvent.change(
      screen.getByRole("combobox", { name: "Filter operator" }),
      {
        target: { value: "contains" },
      },
    );
    fireEvent.change(screen.getByLabelText("Filter value"), {
      target: { value: "Ali" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    });

    await waitFor(() =>
      expect(mockApiService.fetchReferrals).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filterBy: "individualFirstName",
          filterOperator: "contains",
          filterValue: "Ali",
          page: 1,
        }),
      ),
    );
  });

  it("requests the next page when pagination advances", async () => {
    mockApiService.fetchReferrals.mockImplementation(({ page = 1 }) =>
      Promise.resolve({
        data: [testReferral],
        meta: { total: 30, page, limit: 25, totalPages: 2 },
      }),
    );

    renderReferrals();

    await screen.findByText("Showing 1–25 of 30");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    await waitFor(() =>
      expect(mockApiService.fetchReferrals).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 }),
      ),
    );
    expect(await screen.findByText("Showing 26–30 of 30")).toBeInTheDocument();
  });

  it("shows an alert when export fails", async () => {
    mockApiService.fetchReferralsForExport.mockRejectedValue(
      new Error("Export unavailable"),
    );

    renderReferrals();

    await screen.findByText("Alice");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Export unavailable",
    );
    expect(mockDownloadCsv).not.toHaveBeenCalled();
  });

  it("saves selected column settings from the column picker", async () => {
    renderReferrals();

    await screen.findByText("Alice");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Columns (3)" }));
    });

    expect(await screen.findByText("Choose columns")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    await waitFor(() =>
      expect(mockApiService.updateAdminColumns).toHaveBeenCalledWith([
        "flag",
        "createdAt",
        "individualFirstName",
      ]),
    );
    await waitFor(() =>
      expect(screen.queryByText("Choose columns")).not.toBeInTheDocument(),
    );
  });
});
