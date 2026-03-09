import { useQuery } from "@tanstack/react-query";
import { Section } from "../ui";
import { apiService } from "../../services";
import type { AuditLogEntry } from "../../types";

/**
 * Overrides for field names that don't convert cleanly from camelCase.
 * Most fields are auto-derived via camelCaseToLabel().
 */
const fieldLabelOverrides: Record<string, string> = {
  assignedTo: "Assigned To",
  region: "Region",
  ministry: "Ministry",
  agencyType: "Agency Type",
  specificCityTown: "City/Town",
  gainFile: "GAIN File",
  referralStatus: "Status",
  referralOutcome: "Outcome",
};

/**
 * Convert a camelCase field name to a human-readable "Title Case" label.
 * e.g. "individualFirstName" → "Individual First Name"
 */
function camelCaseToLabel(field: string): string {
  return field
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Format a field name to its human-readable label, using overrides
 * for edge cases and auto-deriving the rest from camelCase.
 */
function getFieldLabel(fieldChanged: string): string {
  return fieldLabelOverrides[fieldChanged] ?? camelCaseToLabel(fieldChanged);
}

/**
 * Format a date string to a localized date/time display
 */
function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a value for display, showing a placeholder for empty values
 */
function formatValue(value: string | null): string {
  if (value === null || value === "") {
    return "—";
  }
  return value;
}

interface AuditHistoryTabProps {
  referralId: string;
}

export function AuditHistoryTab({
  referralId,
}: Readonly<AuditHistoryTabProps>) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["auditLog", referralId],
    queryFn: () => apiService.fetchAuditLog(referralId),
    enabled: !!referralId,
  });

  const entries: AuditLogEntry[] = data?.data ?? [];

  return (
    <Section title="Audit History">
      <p className="text-amber-800 bg-amber-100 border border-amber-200 rounded p-3 text-sm mb-4">
        This section is only visible to system administrators.
      </p>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full border-collapse text-sm min-w-[600px]">
          <thead>
            <tr>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Date/Time
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Action
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Field Changed
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Old Value
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                New Value
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
            {error && (
              <tr>
                <td colSpan={6} className="text-center text-red-600 p-8">
                  Failed to load audit history.
                </td>
              </tr>
            )}
            {!isLoading && !error && entries.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-bcgov-gray p-8">
                  No audit history available.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">
                  {formatDateTime(entry.changedAt)}
                </td>
                <td className="p-3 border-b border-gray-200">{entry.action}</td>
                <td className="p-3 border-b border-gray-200">
                  {getFieldLabel(entry.fieldChanged)}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {formatValue(entry.oldValue)}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {formatValue(entry.newValue)}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {entry.changedByUser?.fullName ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
