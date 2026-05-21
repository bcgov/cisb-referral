import { fireEvent, render, screen } from "@testing-library/react";
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
    mockApiService.fetchReferrals.mockResolvedValue({
      data: [testReferral],
      meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
    });
    mockApiService.fetchAdminColumns.mockResolvedValue([
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
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(
      await screen.findByText(/Exported first 1 of 2 referrals/),
    ).toHaveTextContent("Exported first 1 of 2 referrals");
    expect(mockDownloadCsv).toHaveBeenCalledOnce();
  });
});
