import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { apiService } from "../services";
import { useCurrentUser } from "../hooks";
import type { GlobalAuditLogEntry } from "../types";

const TABLE_NAME_LABELS: Record<string, string> = {
  user: "User",
  ministry: "Ministry",
  agency_type: "Agency Type",
  region: "Region",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Removed",
  STATUS_CHANGE: "Status Changed",
};

const TABLE_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "user", label: "User" },
  { value: "ministry", label: "Ministry" },
  { value: "agency_type", label: "Agency Type" },
  { value: "region", label: "Region" },
] as const;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AuditGroup {
  key: string;
  action: string;
  tableName: string;
  recordId: string;
  createdAt: string;
  author: string;
  entries: GlobalAuditLogEntry[];
}

function groupLogs(logs: GlobalAuditLogEntry[]): AuditGroup[] {
  const map = new Map<string, AuditGroup>();

  for (const log of logs) {
    const key = `${log.createdAt}-${log.action}-${log.recordId}`;
    const existing = map.get(key);
    if (existing) {
      existing.entries.push(log);
    } else {
      map.set(key, {
        key,
        action: log.action,
        tableName: log.tableName,
        recordId: log.recordId,
        createdAt: log.createdAt,
        author: log.author?.fullName ?? "System",
        entries: [log],
      });
    }
  }

  return [...map.values()];
}

function ChevronIcon({ expanded }: Readonly<{ expanded: boolean }>) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export function AuditHistory() {
  const { isSystemAdmin, isLoading: isUserLoading } = useCurrentUser();
  const [tableName, setTableName] = useState("");
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const limit = 50;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", tableName, page],
    queryFn: () =>
      apiService.fetchAuditLogs({
        ...(tableName && { tableName }),
        page,
        limit,
      }),
    enabled: isSystemAdmin,
  });

  if (isUserLoading) {
    return null;
  }

  if (!isSystemAdmin) {
    return <Navigate to="/referrals" replace />;
  }

  const logs = data?.data ?? [];
  const meta = data?.meta;
  const groups = groupLogs(logs);

  const toggleGroup = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bcgov-blue">Audit History</h1>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label
          htmlFor="table-filter"
          className="text-sm font-medium text-bcgov-gray-dark"
        >
          Filter by table:
        </label>
        <select
          id="table-filter"
          value={tableName}
          onChange={(e) => {
            setTableName(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 border border-bcgov-blue rounded text-sm
            focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
        >
          {TABLE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[700px]">
          <thead>
            <tr>
              <th className="w-8 p-3 border-b border-gray-200 bg-gray-100" />
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Date/Time
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Table
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Action
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Changes
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Changed By
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center text-bcgov-gray p-8">
                  Loading audit history...
                </td>
              </tr>
            )}
            {!isLoading && groups.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-bcgov-gray p-8">
                  No audit history available.
                </td>
              </tr>
            )}
            {!isLoading &&
              groups.map((group) => {
                const expanded = expandedKeys.has(group.key);

                return (
                  <GroupRow
                    key={group.key}
                    group={group}
                    expanded={expanded}
                    onToggle={() => toggleGroup(group.key)}
                  />
                );
              })}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-bcgov-gray">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-sm border border-bcgov-blue rounded
                text-bcgov-blue hover:bg-bcgov-blue hover:text-white
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm border border-bcgov-blue rounded
                text-bcgov-blue hover:bg-bcgov-blue hover:text-white
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface GroupRowProps {
  group: AuditGroup;
  expanded: boolean;
  onToggle: () => void;
}

function GroupRow({ group, expanded, onToggle }: Readonly<GroupRowProps>) {
  const fieldEntries = group.entries.filter((e) => e.field);
  const fieldCount = fieldEntries.length;
  const isExpandable = fieldCount > 1;
  const singleEntry = fieldCount === 1 ? fieldEntries[0] : null;

  let summary;
  if (singleEntry) {
    summary = (
      <span>
        <span className="font-medium">{singleEntry.field}:</span>{" "}
        {singleEntry.oldValue && (
          <>
            <span className="text-bcgov-gray">{singleEntry.oldValue}</span>
            <span className="mx-1">&rarr;</span>
          </>
        )}
        <span>{singleEntry.newValue ?? "—"}</span>
      </span>
    );
  } else if (fieldCount > 1) {
    summary = `${fieldCount} fields changed`;
  } else {
    summary = "—";
  }

  return (
    <>
      <tr
        className={`border-b border-gray-100 ${isExpandable ? "cursor-pointer hover:bg-gray-50" : ""}`}
        onClick={isExpandable ? onToggle : undefined}
      >
        <td className="p-3 text-center">
          {isExpandable && <ChevronIcon expanded={expanded} />}
        </td>
        <td className="p-3">{formatDate(group.createdAt)}</td>
        <td className="p-3">
          {TABLE_NAME_LABELS[group.tableName] ?? group.tableName}
        </td>
        <td className="p-3">{ACTION_LABELS[group.action] ?? group.action}</td>
        <td className="p-3 text-bcgov-gray text-xs">{summary}</td>
        <td className="p-3">{group.author}</td>
      </tr>
      {expanded &&
        fieldEntries.map((entry) => (
          <tr key={entry.id} className="bg-gray-50 border-b border-gray-100">
            <td className="p-3" />
            <td className="p-3" />
            <td className="p-3" />
            <td className="p-3 text-xs font-medium text-bcgov-gray-dark">
              {entry.field}
            </td>
            <td className="p-3 text-xs" colSpan={2}>
              {entry.oldValue && (
                <>
                  <span className="text-bcgov-gray">{entry.oldValue}</span>
                  <span className="mx-1">&rarr;</span>
                </>
              )}
              <span>{entry.newValue ?? "—"}</span>
            </td>
          </tr>
        ))}
    </>
  );
}
