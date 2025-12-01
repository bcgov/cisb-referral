import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, Section, FieldGrid, Field } from "../components/ui";

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
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <div className="flex flex-col gap-2">
          <Link
            to="/referrals"
            className="text-bcgov-link no-underline text-sm hover:underline"
          >
            ← Back to Referrals
          </Link>
          <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">
            Referral #{id}
          </h1>
        </div>
      </div>

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      <div className="p-6 bg-white flex-1">
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
      <p className="text-bcgov-gray italic">
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
      <p className="text-amber-800 bg-amber-100 border border-amber-200 rounded p-3 text-sm mb-4">
        This section is only visible to system administrators.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
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
            <tr>
              <td colSpan={6} className="text-center text-bcgov-gray p-8">
                No audit history available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  );
}
