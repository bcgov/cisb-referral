import { useNavigate } from "react-router-dom";

interface Referral {
  id: number;
  urgent: boolean;
  createdOn: string;
  referrerContactName: string;
  referredBy: string;
  status: string;
  outcome: string;
  firstName: string;
  lastName: string;
  currentRegion: string;
  city: string;
  teamMember: string;
}

const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-bcgov-link",
  assigned: "bg-amber-100 text-amber-800",
  contactmade: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-bcgov-gray",
};

export function Referrals() {
  const navigate = useNavigate();

  // TODO: Fetch referrals from API
  const referrals: Referral[] = [
    {
      id: 1,
      urgent: true,
      createdOn: "12/1/2024 2:30 PM",
      referrerContactName: "Adam Hodgins",
      referredBy: "Partner Ministry",
      status: "Open",
      outcome: "",
      firstName: "John",
      lastName: "Smith",
      currentRegion: "Interior North: Vernon...",
      city: "100 Mile",
      teamMember: "",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">
          Referrals
        </h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by keyword"
            className="py-2 px-3 border border-bcgov-border rounded text-sm w-50 focus:outline-none focus:border-bcgov-blue focus:ring-2 focus:ring-bcgov-blue/20"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full border-collapse text-sm table-fixed">
          <thead>
            <tr>
              <th className="w-10 text-center p-3 border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10">
                <input type="checkbox" />
              </th>
              <th className="w-[70px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Urgent
              </th>
              <th className="w-[130px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Created On
              </th>
              <th className="w-40 p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Referred By: Contact Name
              </th>
              <th className="w-[120px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Referred By
              </th>
              <th className="w-[110px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Referral Status
              </th>
              <th className="w-[120px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Referral Outcome
              </th>
              <th className="w-[100px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                First Name
              </th>
              <th className="w-[100px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Last Name
              </th>
              <th className="w-[140px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                Current Region
              </th>
              <th className="w-[100px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                City/Town
              </th>
              <th className="w-[110px] p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap">
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
              referrals.map((referral) => (
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
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.urgent ? "Yes" : "No"}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.createdOn}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.referrerContactName}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.referredBy}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span
                      className={`inline-block py-1 px-2 rounded text-xs font-medium ${
                        statusStyles[
                          referral.status.toLowerCase().replace("-", "")
                        ] || ""
                      }`}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.outcome}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.firstName}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.lastName}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.currentRegion}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.city}
                  </td>
                  <td className="p-3 border-b border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referral.teamMember}
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
