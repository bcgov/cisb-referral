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
  // TODO: Fetch referrals from API
  const referrals: Referral[] = [];

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
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={13} className="empty-state">
                  No referrals found.
                </td>
              </tr>
            ) : (
              referrals.map((referral) => (
                <tr key={referral.id}>
                  <td className="col-checkbox">
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
                  <td className="col-actions">
                    <button className="icon-button" title="Open referral">
                      ↗
                    </button>
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
