import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Section,
  Field,
  MultiSelect,
  TextInput,
  DateInput,
  SelectInput,
  TextAreaInput,
  ReadOnlyField,
} from "../ui";
import { apiService } from "../../services";
import {
  referredByLabels,
  statusLabels,
  outcomeLabels,
  supportLabels,
} from "../../constants";
import {
  calculateTriageTime,
  calculateContactTime,
  getChangedFields,
} from "../../utils";
import type {
  Referral,
  User,
  UpdateReferralDto,
  Region,
  Ministry,
  AgencyType,
} from "../../types";
import { ReferralStatus, ReferralOutcome } from "../../types";

const STATUS_OPTIONS = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

const OUTCOME_OPTIONS = [
  { value: "", label: "— Select Outcome —" },
  ...Object.entries(outcomeLabels).map(([value, label]) => ({ value, label })),
];

const FLAG_OPTIONS = [
  { value: "NO", label: "No" },
  { value: "YES", label: "Yes" },
] as const;

const REFERRED_BY_OPTIONS = [
  { value: "", label: "— Select —" },
  ...Object.entries(referredByLabels).map(([value, label]) => ({
    value,
    label,
  })),
];

interface ReferralDetailsTabProps {
  referral: Referral;
  users: User[];
  onUpdate: () => void;
}

export function ReferralDetailsTab({
  referral,
  users,
  onUpdate,
}: Readonly<ReferralDetailsTabProps>) {
  const initialFormData = useMemo<UpdateReferralDto>(
    () => ({
      referralStatus: referral.referralStatus as ReferralStatus,
      referralOutcome: referral.referralOutcome as ReferralOutcome | null,
      assignedToId: referral.assignedToId,
      communityPartnerName: referral.communityPartnerName,
      flag: referral.flag,
      assignedOn: referral.assignedOn,
      firstContactMadeOn: referral.firstContactMadeOn,
      currentlyConnectedSupports: referral.currentlyConnectedSupports,
      currentlyConnectedSupportsOther: referral.currentlyConnectedSupportsOther,
      regionId: referral.regionId,
      specificCityTown: referral.specificCityTown,
      neededSupports: referral.neededSupports,
      neededSupportsOther: referral.neededSupportsOther,
      referralSummary: referral.referralSummary,
      referredBy: referral.referredBy,
      ministryId: referral.ministryId,
      ministryNameOther: referral.ministryNameOther,
      agencyTypeId: referral.agencyTypeId,
      agencyTypeOther: referral.agencyTypeOther,
      partnerAgencyName: referral.partnerAgencyName,
      programArea: referral.programArea,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [referral.id],
  );
  const [formData, setFormData] = useState<UpdateReferralDto>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: () => apiService.fetchRegions(),
  });

  const { data: ministries = [] } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => apiService.fetchMinistries(),
  });

  const { data: agencyTypes = [] } = useQuery({
    queryKey: ["agencyTypes"],
    queryFn: () => apiService.fetchAgencyTypes(),
  });

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const selectedUser = users.find((u) => u.id === formData.assignedToId);

  const supportOptions = Object.entries(supportLabels).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const regionOptions = [
    { value: "", label: "— Select Region —" },
    ...regions.map((region: Region) => ({
      value: region.id,
      label: region.name,
    })),
  ];

  const ministryOptions = [
    { value: "", label: "— Select Ministry —" },
    ...ministries
      .filter((m: Ministry) => m.isActive)
      .map((ministry: Ministry) => ({
        value: ministry.id,
        label: ministry.name,
      })),
  ];

  const agencyTypeOptions = [
    { value: "", label: "— Select Agency Type —" },
    ...agencyTypes
      .filter((a: AgencyType) => a.isActive)
      .map((agencyType: AgencyType) => ({
        value: agencyType.id,
        label: agencyType.name,
      })),
  ];

  const updateField = <K extends keyof UpdateReferralDto>(
    field: K,
    value: UpdateReferralDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    if (
      formData.referralStatus === ReferralStatus.CLOSED &&
      !formData.referralOutcome
    ) {
      setSaveError(
        "A referral outcome must be selected before closing the referral.",
      );
      return;
    }

    setSaving(true);

    try {
      const changedFields = getChangedFields(formData, initialFormData);
      if (Object.keys(changedFields).length === 0) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return;
      }
      await apiService.updateReferral(referral.id, changedFields);
      setSaveSuccess(true);
      onUpdate();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSaveError(
        error.response?.data?.message || "Failed to update referral.",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <SelectInput
            label="Referral Outcome"
            value={formData.referralOutcome}
            onChange={(v) =>
              updateField("referralOutcome", (v as ReferralOutcome) || null)
            }
            options={OUTCOME_OPTIONS}
          />
          <div>
            <label
              htmlFor="assignedTeamMember"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Assigned Team Member
            </label>
            <div className="relative">
              <input
                id="assignedTeamMember"
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
                      updateField("assignedToId", null);
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
                        updateField("assignedToId", user.id);
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
          <TextInput
            label="Community Partner Name"
            value={formData.communityPartnerName}
            onChange={(v) => updateField("communityPartnerName", v)}
          />
          <ReadOnlyField
            label="Assigned Team Member Email"
            value={selectedUser?.email}
          />
        </div>
      </Section>

      <Section title="Referred By Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <SelectInput
              label="Referred By"
              value={formData.referredBy}
              onChange={(v) => updateField("referredBy", v || "")}
              options={REFERRED_BY_OPTIONS}
            />
          </div>
          <SelectInput
            label="Name of Ministry"
            value={formData.ministryId}
            onChange={(v) => updateField("ministryId", v)}
            options={ministryOptions}
          />
          <TextInput
            label="Name of Agency"
            value={formData.partnerAgencyName}
            onChange={(v) => updateField("partnerAgencyName", v)}
          />
          <TextInput
            label="Other Ministry"
            value={formData.ministryNameOther}
            onChange={(v) => updateField("ministryNameOther", v)}
          />
          <SelectInput
            label="Type of Agency"
            value={formData.agencyTypeId}
            onChange={(v) => updateField("agencyTypeId", v)}
            options={agencyTypeOptions}
          />
          <TextInput
            label="Program Area"
            value={formData.programArea}
            onChange={(v) => updateField("programArea", v)}
          />
          <TextInput
            label="Other Agency"
            value={formData.agencyTypeOther}
            onChange={(v) => updateField("agencyTypeOther", v)}
          />
        </div>
      </Section>

      <Section title="Progress and Status">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <SelectInput
            label="Referral Status"
            value={formData.referralStatus}
            onChange={(v) => updateField("referralStatus", v as ReferralStatus)}
            options={STATUS_OPTIONS}
          />
          <SelectInput
            label="Flagged Urgent"
            value={formData.flag ? "YES" : "NO"}
            onChange={(v) => updateField("flag", v === "YES")}
            options={FLAG_OPTIONS}
          />
          <DateInput
            label="Assigned On"
            value={formData.assignedOn}
            onChange={(v) => updateField("assignedOn", v)}
          />
          <DateInput
            label="First Contact Made On"
            value={formData.firstContactMadeOn}
            onChange={(v) => updateField("firstContactMadeOn", v)}
          />
          <Field
            label="Length of Time to Triage"
            value={calculateTriageTime(referral.createdAt, referral.assignedOn)}
          />
          <Field
            label="Length of Time to Contact After Triage"
            value={calculateContactTime(
              referral.assignedOn,
              referral.firstContactMadeOn,
            )}
          />
        </div>
      </Section>

      <Section title="Other Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <MultiSelect
            id="currentlyConnectedSupports"
            label="Supports Currently Connected"
            options={supportOptions}
            value={formData.currentlyConnectedSupports || []}
            onChange={(values) =>
              updateField("currentlyConnectedSupports", values)
            }
            placeholder="Search supports..."
          />
          <SelectInput
            label="Current Region"
            value={formData.regionId}
            onChange={(v) => updateField("regionId", v)}
            options={regionOptions}
          />
          <TextInput
            label="Other Currently Connected Supports"
            value={formData.currentlyConnectedSupportsOther}
            onChange={(v) => updateField("currentlyConnectedSupportsOther", v)}
          />
          <TextInput
            label="Specific City/Town"
            value={formData.specificCityTown}
            onChange={(v) => updateField("specificCityTown", v)}
          />
          <MultiSelect
            id="neededSupports"
            label="Needed Supports"
            options={supportOptions}
            value={formData.neededSupports || []}
            onChange={(values) => updateField("neededSupports", values)}
            placeholder="Search supports..."
          />
          <TextInput
            label="Other Needed Supports"
            value={formData.neededSupportsOther}
            onChange={(v) => updateField("neededSupportsOther", v)}
          />
          <TextAreaInput
            label="Referral Reason"
            value={formData.referralSummary}
            onChange={(v) => updateField("referralSummary", v)}
            rows={5}
            fullWidth
          />
        </div>
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
