import { useNavigate } from "react-router-dom";
import "./Referrals.css";

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
    <div className="page-container">
      <div className="page-header">
        <h1>Referrals</h1>
        <div className="page-actions">
          <input
            type="text"
            placeholder="Filter by keyword"
            className="filter-input"
          />
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input type="checkbox" />
              </th>
              <th className="col-urgent">Urgent</th>
              <th className="col-date">Created On</th>
              <th className="col-contact-name">Referred By: Contact Name</th>
              <th className="col-referred-by">Referred By</th>
              <th className="col-status">Referral Status</th>
              <th className="col-outcome">Referral Outcome</th>
              <th className="col-name">First Name</th>
              <th className="col-name">Last Name</th>
              <th className="col-region">Current Region</th>
              <th className="col-city">City/Town</th>
              <th className="col-team-member">Team Member</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={12} className="empty-state">
                  No referrals found.
                </td>
              </tr>
            ) : (
              referrals.map((referral) => (
                <tr
                  key={referral.id}
                  className="clickable-row"
                  onClick={(e) => {
                    // Don't navigate if clicking on checkbox
                    if ((e.target as HTMLElement).tagName !== "INPUT") {
                      navigate(`/referrals/${referral.id}`);
                    }
                  }}
                >
                  <td
                    className="col-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input type="checkbox" />
                  </td>
                  <td className="col-urgent">
                    {referral.urgent ? "Yes" : "No"}
                  </td>
                  <td className="col-date">{referral.createdOn}</td>
                  <td className="col-contact-name">
                    {referral.referrerContactName}
                  </td>
                  <td className="col-referred-by">{referral.referredBy}</td>
                  <td className="col-status">
                    <span
                      className={`status-badge status-${referral.status
                        .toLowerCase()
                        .replace("-", "")}`}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td className="col-outcome">{referral.outcome}</td>
                  <td className="col-name">{referral.firstName}</td>
                  <td className="col-name">{referral.lastName}</td>
                  <td className="col-region">{referral.currentRegion}</td>
                  <td className="col-city">{referral.city}</td>
                  <td className="col-team-member">{referral.teamMember}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
