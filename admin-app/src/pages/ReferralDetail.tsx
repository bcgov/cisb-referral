import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, Section, FieldGrid, Field } from "../components/ui";
import "./ReferralDetail.css";

type TabType = "details" | "referrer-individual" | "related";

const TABS = [
  { id: "details", label: "Referral Details" },
  { id: "referrer-individual", label: "Referrer & Individual Info" },
  { id: "related", label: "Audit History" },
] as const;

export function ReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("details");

  // TODO: Fetch referral from API using id

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <Link to="/referrals" className="back-link">
            ← Back to Referrals
          </Link>
          <h1>Referral #{id}</h1>
        </div>
      </div>

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      <div className="detail-content">
        {activeTab === "details" && <ReferralDetailsTab />}
        {activeTab === "referrer-individual" && <ReferrerIndividualTab />}
        {activeTab === "related" && <AuditHistoryTab />}
      </div>
    </div>
  );
}

function ReferralDetailsTab() {
  return (
    <>
      <Section title="Referral Outcome and Assignment">
        <FieldGrid>
          <Field label="Referral Outcome" value="—" />
          <Field label="Assigned Team Member" value="—" />
          <Field label="Community Partner Name" value="—" />
          <Field label="Assigned Team Member Email" value="—" />
        </FieldGrid>
      </Section>

      <Section title="Referred By Info">
        <FieldGrid>
          <Field label="Referred By" value="—" />
          <Field label="Name of Agency" value="—" />
          <Field label="Name of Ministry" value="—" />
          <Field label="Type of Agency" value="—" />
          <Field label="Other Ministry" value="—" />
          <Field label="Other Agency" value="—" />
          <Field label="Program Area" value="—" />
        </FieldGrid>
      </Section>

      <Section title="Progress and Status">
        <FieldGrid>
          <Field label="Referral Status" value="—" />
          <Field label="Flagged Urgent" value="—" />
          <Field label="Assigned On" value="—" />
          <Field label="First Contact Made On" value="—" />
          <Field label="Length Of Time To Triage (Hours)" value="—" />
          <Field
            label="Length Of Time To Contact After Triage (Hours)"
            value="—"
          />
        </FieldGrid>
      </Section>

      <Section title="Other Details">
        <FieldGrid>
          <Field label="Supports Currently Connected" value="—" />
          <Field label="Current Region" value="—" />
          <Field label="Other Currently Connected Supports" value="—" />
          <Field label="Specific City/Town" value="—" />
          <Field label="Needed Supports" value="—" />
          <Field label="Referral Reason" value="—" fullWidth />
          <Field label="Other Needed Supports" value="—" />
        </FieldGrid>
      </Section>
    </>
  );
}

function ReferrerIndividualTab() {
  return (
    <Section title="Referrer & Individual Information">
      <p className="placeholder-text">
        Referrer and individual information will be displayed here.
      </p>
    </Section>
  );
}

function AuditHistoryTab() {
  // TODO: Check if user is system admin, hide tab if not
  // TODO: Fetch audit history from API

  return (
    <Section title="Audit History">
      <p className="admin-notice">
        This section is only visible to system administrators.
      </p>
      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Action</th>
              <th>Field Changed</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Changed By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="empty-state">
                No audit history available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  );
}
