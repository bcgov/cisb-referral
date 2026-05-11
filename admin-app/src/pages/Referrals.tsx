import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiService } from "../services";
import { toCsv, downloadCsv } from "../utils";
import type { Referral } from "../types";
import { ColumnPicker } from "./referrals/ColumnPicker";
import { resolveColumns } from "./referrals/columns";

const PAGE_SIZE = 25;

const ADMIN_COLUMNS_QUERY_KEY = ["settings", "admin-columns"] as const;

function buildExportFilename(): string {
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  return `referrals-${stamp}.csv`;
}

/** Referrals list page with a configurable, exportable data table. */
export function Referrals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "referrals",
      { page, limit: PAGE_SIZE, search: activeSearch || undefined },
    ],
    queryFn: () =>
      apiService.fetchReferrals({
        page,
        limit: PAGE_SIZE,
        search: activeSearch || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: columnKeys } = useQuery({
    queryKey: ADMIN_COLUMNS_QUERY_KEY,
    queryFn: () => apiService.fetchAdminColumns(),
  });

  const columns = useMemo(() => resolveColumns(columnKeys), [columnKeys]);

  const saveColumns = useMutation({
    mutationFn: (keys: string[]) => apiService.updateAdminColumns(keys),
    onSuccess: (saved) => {
      queryClient.setQueryData(ADMIN_COLUMNS_QUERY_KEY, saved);
      setPickerOpen(false);
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const all = await apiService.fetchReferralsForExport();
      const headers = columns.map((c) => c.label);
      const rows = all.map((r: Referral) =>
        columns.map((c) => {
          const v = c.render(r);
          return v === "—" ? "" : v;
        }),
      );
      downloadCsv(buildExportFilename(), toCsv(headers, rows));
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to export referrals.";
      setExportError(message);
    },
    onSuccess: () => setExportError(null),
  });

  const referrals = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading referrals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">
          Error loading referrals. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 sm:px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">
          Referrals
        </h1>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Filter by keyword"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setActiveSearch(search.trim());
                setPage(1);
              }
            }}
            className="py-2 px-3 border border-bcgov-border rounded text-sm
              w-full sm:w-50 focus:outline-none focus:border-bcgov-blue
              focus:ring-2 focus:ring-bcgov-blue/20"
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="py-2 px-3 border border-bcgov-border rounded text-sm
              bg-white hover:bg-bcgov-gray-light text-bcgov-gray-dark
              focus:outline-none focus:ring-2 focus:ring-bcgov-blue/20"
          >
            Columns ({columns.length})
          </button>
          <button
            type="button"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending || columns.length === 0}
            className="py-2 px-3 rounded text-sm bg-bcgov-blue text-white
              hover:bg-bcgov-blue-dark disabled:opacity-50
              disabled:cursor-not-allowed focus:outline-none focus:ring-2
              focus:ring-bcgov-blue/30"
          >
            {exportMutation.isPending ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {exportError ? (
        <div
          role="alert"
          className="px-4 sm:px-6 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700"
        >
          {exportError}
        </div>
      ) : null}

      <div className="flex-1 overflow-auto bg-white">
        <table className="border-collapse text-sm table-fixed min-w-full">
          <thead>
            <tr>
              <th className="w-10 text-center p-3 border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10">
                <input type="checkbox" aria-label="Select all referrals" />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.width} p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center p-8 text-bcgov-gray"
                >
                  No referrals found.
                </td>
              </tr>
            ) : (
              referrals.map((referral: Referral) => (
                <tr
                  key={referral.id}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).tagName !== "INPUT") {
                      navigate(`/referrals/${referral.id}`);
                    }
                  }}
                >
                  <td
                    className="w-10 text-center p-3 border-b border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select referral ${referral.id}`}
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.width} p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap`}
                    >
                      {col.render(referral)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 bg-white border-t border-bcgov-border text-sm text-bcgov-gray-dark">
        <span>
          {total === 0
            ? "No referrals"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                page * PAGE_SIZE,
                total,
              )} of ${total}`}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            className="py-1 px-3 border border-bcgov-border rounded bg-white
              hover:bg-bcgov-gray-light disabled:opacity-50
              disabled:cursor-not-allowed focus:outline-none focus:ring-2
              focus:ring-bcgov-blue/20"
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {page} of {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext}
            className="py-1 px-3 border border-bcgov-border rounded bg-white
              hover:bg-bcgov-gray-light disabled:opacity-50
              disabled:cursor-not-allowed focus:outline-none focus:ring-2
              focus:ring-bcgov-blue/20"
          >
            Next
          </button>
        </div>
      </div>

      {pickerOpen ? (
        <ColumnPicker
          selectedKeys={columns.map((c) => c.key)}
          onSave={(keys) => saveColumns.mutate(keys)}
          onClose={() => setPickerOpen(false)}
          saving={saveColumns.isPending}
        />
      ) : null}
    </div>
  );
}
