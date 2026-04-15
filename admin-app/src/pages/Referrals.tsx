import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services";
import { referredByLabels } from "../constants";
import type { Referral } from "../types";

const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-bcgov-link",
  assigned: "bg-amber-100 text-amber-800",
  contact_made: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-bcgov-gray",
};

/**
 * Formats an ISO date string for display.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Referrals list page with a scrollable data table. */
export function Referrals() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["referrals"],
    queryFn: () => apiService.fetchReferrals(),
  });

  const referrals = data?.data ?? [];

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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by keyword"
            className="py-2 px-3 border border-bcgov-border rounded text-sm
              w-full sm:w-50 focus:outline-none focus:border-bcgov-blue
              focus:ring-2 focus:ring-bcgov-blue/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full border-collapse text-sm table-fixed min-w-[900px]">
          <thead>
            <tr>
              <th className="w-10 text-center p-3 border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10">
                <input type="checkbox" aria-label="Select all referrals" />
              </th>
              <th className="w-[70px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Urgent
              </th>
              <th className="w-[130px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Created On
              </th>
              <th className="w-40 p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Referred By: Contact Name
              </th>
              <th className="w-[120px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Referred By
              </th>
              <th className="w-[110px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Referral Status
              </th>
              <th className="w-[120px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Referral Outcome
              </th>
              <th className="w-[100px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                First Name
              </th>
              <th className="w-[100px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Last Name
              </th>
              <th className="w-[140px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Current Region
              </th>
              <th className="w-[100px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                City/Town
              </th>
              <th className="w-[110px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 whitespace-nowrap">
                Team Member
              </th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center p-8 text-bcgov-gray">
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
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.flag ? "Yes" : "No"}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {formatDate(referral.createdAt)}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.referrerContactName}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referredByLabels[referral.referredBy] ||
                      referral.referredBy}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span
                      className={`inline-block py-1 px-2 rounded text-xs font-medium ${
                        statusStyles[referral.referralStatus.toLowerCase()] ||
                        ""
                      }`}
                    >
                      {referral.referralStatus}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.referralOutcome || "—"}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.individualFirstName || "—"}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.individualLastName || "—"}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.region?.name || "—"}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.specificCityTown || "—"}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.assignedTo?.fullName || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
