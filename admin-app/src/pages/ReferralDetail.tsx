import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, Section, FieldGrid, Field } from "../components/ui";
import { apiService } from "../services";
import { referredByLabels } from "../constants";
import type { Referral, User, UpdateReferralDto } from "../types";
import { ReferralStatus, ReferralOutcome } from "../types";

type TabType = "details" | "referrer-individual" | "related";

const TABS = [
  { id: "details", label: "Referral Details" },
  { id: "referrer-individual", label: "Referrer & Individual Info" },
  { id: "related", label: "Audit History" },
] as const;

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

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  CONTACT_MADE: "Contact Made",
  CLOSED: "Closed",
};

const outcomeLabels: Record<string, string> = {
  BCEA_APPLICATION_SUBMITTED: "BCEA Application Submitted",
  BCEA_APPLICATION_COMPLETED_FILE_OPENED:
    "BCEA Application Completed - File Opened",
  SUPPLEMENTS_ISSUED: "Supplements Issued",
  CASE_MANAGED: "Case Managed",
  SERVICES_PROVIDED: "Services Provided",
  NOT_LOCATED: "Not Located",
  LOCATED_REFUSED_SERVICE: "Located - Refused Service",
  NON_APPROPRIATE_REFERRAL_RETURNED: "Non-Appropriate Referral - Returned",
  REFERRED_TO_VS_CS: "Referred to VS/CS",
  REFERRED_TO_COMMUNITY_PARTNER: "Referred to Community Partner",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSupports(supports: string[]): string {
  if (!supports || supports.length === 0) return "—";
  return supports.map((s) => supportLabels[s] || s).join(", ");
}

function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

export function ReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const queryClient = useQueryClient();

  const {
    data: referral,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["referral", id],
    queryFn: () => apiService.fetchReferral(id!),
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiService.fetchUsers(),
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
            Referral #{id?.substring(0, 8)}
          </h1>
        </div>
      </div>

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      <div className="p-6 bg-white flex-1">
        {activeTab === "details" && (
          <ReferralDetailsTab
            key={referral.id}
            referral={referral}
            users={users}
            onUpdate={() =>
              queryClient.invalidateQueries({ queryKey: ["referral", id] })
            }
          />
        )}
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

interface EditableTabProps extends TabProps {
  users: User[];
  onUpdate: () => void;
}

function ReferralDetailsTab({ referral, users, onUpdate }: EditableTabProps) {
  const [formData, setFormData] = useState<UpdateReferralDto>({
    referralStatus: referral.referralStatus as ReferralStatus,
    referralOutcome: referral.referralOutcome as ReferralOutcome | null,
    assignedToId: referral.assignedToId,
    communityPartnerName: referral.communityPartnerName,
    flag: referral.flag,
    assignedOn: referral.assignedOn,
    firstContactMadeOn: referral.firstContactMadeOn,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = users.find((u) => u.id === formData.assignedToId);

  // Calculate triage time (hours from creation to assignment)
  const calculateTriageTime = (): string => {
    if (!referral.assignedOn) return "—";
    const created = new Date(referral.createdAt);
    const assigned = new Date(referral.assignedOn);
    const hours = Math.round(
      (assigned.getTime() - created.getTime()) / (1000 * 60 * 60)
    );
    return `${hours} hours`;
  };

  // Calculate contact time (hours from assignment to first contact)
  const calculateContactTime = (): string => {
    if (!referral.assignedOn || !referral.firstContactMadeOn) return "—";
    const assigned = new Date(referral.assignedOn);
    const contacted = new Date(referral.firstContactMadeOn);
    const hours = Math.round(
      (contacted.getTime() - assigned.getTime()) / (1000 * 60 * 60)
    );
    return `${hours} hours`;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await apiService.updateReferral(referral.id, formData);
      setSaveSuccess(true);
      onUpdate();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Failed to update referral:", error);
      setSaveError(
        error.response?.data?.message || "Failed to update referral"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          Referral updated successfully.
        </div>
      )}

      <Section title="Referral Outcome and Assignment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Referral Outcome
            </label>
            <select
              value={formData.referralOutcome || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  referralOutcome: (e.target.value as ReferralOutcome) || null,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            >
              <option value="">— Select Outcome —</option>
              {Object.entries(outcomeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Assigned Team Member
            </label>
            <div className="relative">
              <input
                type="text"
                value={
                  showUserDropdown ? userSearch : selectedUser?.fullName || ""
                }
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setShowUserDropdown(true);
                }}
                onFocus={() => {
                  setShowUserDropdown(true);
                  setUserSearch("");
                }}
                onBlur={() => {
                  setTimeout(() => setShowUserDropdown(false), 200);
                }}
                placeholder="Search team members..."
                className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              />
              {showUserDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-bcgov-border rounded shadow-lg max-h-48 overflow-auto">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-bcgov-gray"
                    onMouseDown={() => {
                      setFormData({ ...formData, assignedToId: null });
                      setUserSearch("");
                      setShowUserDropdown(false);
                    }}
                  >
                    — Clear Selection —
                  </button>
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-100"
                      onMouseDown={() => {
                        setFormData({ ...formData, assignedToId: user.id });
                        setUserSearch("");
                        setShowUserDropdown(false);
                      }}
                    >
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-bcgov-gray">
                        {user.email}
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="px-3 py-2 text-bcgov-gray">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Community Partner Name
            </label>
            <input
              type="text"
              value={formData.communityPartnerName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  communityPartnerName: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Assigned Team Member Email
            </label>
            <input
              type="text"
              value={selectedUser?.email || "—"}
              disabled
              className="w-full px-3 py-2 border border-bcgov-border rounded bg-gray-100 text-bcgov-gray"
            />
          </div>
        </div>
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
            label="Name of Agency"
            value={referral.partnerAgencyName || "—"}
          />
          <Field
            label="Other Ministry"
            value={referral.ministryNameOther || "—"}
          />
          <Field
            label="Type of Agency"
            value={referral.agencyType?.name || "—"}
          />
          <Field label="Program Area" value={referral.programArea || "—"} />
          <Field label="Other Agency" value={referral.agencyTypeOther || "—"} />
        </FieldGrid>
      </Section>

      <Section title="Progress and Status">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Referral Status
            </label>
            <select
              value={formData.referralStatus || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  referralStatus: e.target.value as ReferralStatus,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Flagged Urgent
            </label>
            <select
              value={formData.flag ? "YES" : "NO"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  flag: e.target.value === "YES",
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            >
              <option value="NO">No</option>
              <option value="YES">Yes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Assigned On
            </label>
            <input
              type="date"
              value={formatDateForInput(formData.assignedOn || null)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assignedOn: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              First Contact Made On
            </label>
            <input
              type="date"
              value={formatDateForInput(formData.firstContactMadeOn || null)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  firstContactMadeOn: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <Field
            label="Length of Time to Triage"
            value={calculateTriageTime()}
          />
          <Field
            label="Length of Time to Contact After Triage"
            value={calculateContactTime()}
          />
        </div>
      </Section>

      <Section title="Housing & Release Info">
        <FieldGrid>
          <Field
            label="Homelessness"
            value={yesNoUnknownLabels[referral.currentlyHomeless || ""] || "—"}
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

      <Section title="Other Details">
        <FieldGrid>
          <Field
            label="Supports Currently Connected"
            value={formatSupports(referral.currentlyConnectedSupports)}
            fullWidth
          />
          <Field label="Current Region" value={referral.region?.name || "—"} />
          <Field
            label="Other Currently Connected Supports"
            value={referral.currentlyConnectedSupportsOther || "—"}
          />
          <Field
            label="Specific City/Town"
            value={referral.specificCityTown || "—"}
          />
          <Field
            label="Needed Supports"
            value={formatSupports(referral.neededSupports)}
            fullWidth
          />
          <Field
            label="Other Needed Supports"
            value={referral.neededSupportsOther || "—"}
          />
          <Field
            label="Referral Reason"
            value={referral.referralSummary || "—"}
            fullWidth
          />
        </FieldGrid>
      </Section>

      <div className="flex justify-end mt-6 pt-4 border-t border-bcgov-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
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
          <Field label="Last Name" value={referral.individualLastName || "—"} />
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
        </FieldGrid>
      </Section>
    </>
  );
}

function AuditHistoryTab() {
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
