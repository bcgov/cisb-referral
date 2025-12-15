import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Tabs, Section, FieldGrid, Field } from "../components/ui";
import { apiService } from "../services";
import type { Referral } from "../types";

type TabType = "details" | "referrer-individual" | "related";

const TABS = [
  { id: "details", label: "Referral Details" },
  { id: "referrer-individual", label: "Referrer & Individual Info" },
  { id: "related", label: "Audit History" },
] as const;

const referredByLabels: Record<string, string> = {
  PARTNER_MINISTRY: "Partner Ministry",
  SDPR_INTERNAL: "SDPR Internal",
  PARTNER_AGENCY: "Partner Agency",
};

const yesNoUnknownLabels: Record<string, string> = {
  YES: "Yes",
  NO: "No",
  UNKNOWN: "Unknown",
};

const releaseFromLabels: Record<string, string> = {
  NO: "No",
  HOSPITAL_MEDICAL_FACILITY: "Hospital/Medical Facility",
  CORRECTIONS: "Corrections",
  YOUTH_TRANSITION_MCFD: "Youth Transition (MCFD)",
  YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY:
    "Youth Transition (Delegated Aboriginal Agency)",
  ALCOHOL_DRUG_FACILITY: "Alcohol/Drug Facility",
};

const supportLabels: Record<string, string> = {
  CULTURAL: "Cultural",
  COMMUNITY_SUPPORTS: "Community Supports",
  FOOD_SECURITY: "Food Security",
  HOUSING: "Housing",
  INCOME_ASSISTANCE_PROVINCIAL: "Income Assistance (Provincial)",
  INCOME_ASSISTANCE_FEDERAL: "Income Assistance (Federal)",
  MENTAL_HEALTH: "Mental Health",
  SYSTEM_NAVIGATION: "System Navigation",
  HEALTH_SERVICES: "Health Services",
  SUBSTANCE_USE: "Substance Use",
  INDIGENOUS_SUPPORTS: "Indigenous Supports",
  INTEGRATED_JUSTICE_SUPPORTS: "Integrated Justice Supports",
  OTHERS: "Others",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSupports(supports: string[]): string {
  if (!supports || supports.length === 0) return "—";
  return supports.map((s) => supportLabels[s] || s).join(", ");
}

export function ReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("details");

  const {
    data: referral,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["referral", id],
    queryFn: () => apiService.fetchReferral(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading referral...</p>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">
          Error loading referral. Please try again.
        </p>
      </div>
    );
  }

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
        {activeTab === "details" && <ReferralDetailsTab referral={referral} />}
        {activeTab === "referrer-individual" && (
          <ReferrerIndividualTab referral={referral} />
        )}
        {activeTab === "related" && <AuditHistoryTab />}
      </div>
    </div>
  );
}

interface TabProps {
  referral: Referral;
}

function ReferralDetailsTab({ referral }: TabProps) {
  return (
    <>
      <Section title="Referral Outcome and Assignment">
        <FieldGrid>
          <Field
            label="Referral Outcome"
            value={referral.referralOutcome || "—"}
          />
          <Field
            label="Assigned Team Member"
            value={referral.assignedToId || "—"}
          />
          <Field
            label="Community Partner Name"
            value={referral.partnerAgencyName || "—"}
          />
        </FieldGrid>
      </Section>

      <Section title="Referred By Info">
        <FieldGrid>
          <Field
            label="Referred By"
            value={referredByLabels[referral.referredBy] || referral.referredBy}
          />
          <Field
            label="Name of Ministry"
            value={referral.ministry?.name || "—"}
          />
          <Field
            label="Type of Agency"
            value={referral.agencyType?.name || "—"}
          />
          <Field label="Program Area" value={referral.programArea || "—"} />
        </FieldGrid>
      </Section>

      <Section title="Progress and Status">
        <FieldGrid>
          <Field label="Referral Status" value={referral.referralStatus} />
          <Field label="Flagged Urgent" value={referral.flag ? "Yes" : "No"} />
          <Field label="Assigned On" value={formatDate(referral.assignedOn)} />
          <Field
            label="First Contact Made On"
            value={formatDate(referral.firstContactMadeOn)}
          />
          <Field label="Created At" value={formatDate(referral.createdAt)} />
        </FieldGrid>
      </Section>

      <Section title="Housing & Release Info">
        <FieldGrid>
          <Field
            label="Homelessness"
            value={yesNoUnknownLabels[referral.homelessness || ""] || "—"}
          />
          <Field
            label="At Risk of Losing Housing"
            value={yesNoUnknownLabels[referral.losingHousing || ""] || "—"}
          />
          <Field
            label="Pending Release From"
            value={releaseFromLabels[referral.pendingRelease || ""] || "—"}
          />
          <Field
            label="Release Date"
            value={formatDate(referral.releaseDate)}
          />
        </FieldGrid>
      </Section>

      <Section title="Support Services">
        <FieldGrid>
          <Field
            label="Currently Connected Supports"
            value={formatSupports(referral.currentlyConnectedSupports)}
            fullWidth
          />
          <Field
            label="Needed Supports"
            value={formatSupports(referral.neededSupports)}
            fullWidth
          />
          <Field label="Current Region" value={referral.region?.name || "—"} />
          <Field label="Specific City/Town" value={referral.city || "—"} />
          <Field
            label="Additional Information"
            value={referral.additionalInformation || "—"}
            fullWidth
          />
        </FieldGrid>
      </Section>
    </>
  );
}

function ReferrerIndividualTab({ referral }: TabProps) {
  return (
    <>
      <Section title="Referrer Contact Information">
        <FieldGrid>
          <Field label="Contact Name" value={referral.referrerContactName} />
          <Field label="Contact Email" value={referral.referrerContactEmail} />
          <Field
            label="Contact Phone"
            value={referral.referrerContactPhone || "—"}
          />
        </FieldGrid>
      </Section>

      <Section title="Individual Information">
        <FieldGrid>
          <Field label="First Name" value={referral.individualFirstName} />
          <Field label="Last Name" value={referral.individualLastName} />
          <Field
            label="Preferred Name"
            value={referral.individualPreferredName || "—"}
          />
          <Field
            label="Date of Birth"
            value={formatDate(referral.individualDateOfBirth)}
          />
          <Field label="Pronouns" value={referral.individualPronouns || "—"} />
          <Field label="Email" value={referral.individualEmail || "—"} />
          <Field label="Phone" value={referral.individualPhone || "—"} />
          <Field
            label="Consent to Contact"
            value={referral.consentToContact ? "Yes" : "No"}
          />
        </FieldGrid>
      </Section>
    </>
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
