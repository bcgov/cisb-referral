import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Section, FieldGrid, Field, MultiSelect } from "../ui";
import { apiService } from "../../services";
import {
  referredByLabels,
  statusLabels,
  outcomeLabels,
  supportLabels,
} from "../../constants";
import {
  formatDateForInput,
  calculateTriageTime,
  calculateContactTime,
} from "../../utils";
import type { Referral, User, UpdateReferralDto, Region } from "../../types";
import { ReferralStatus, ReferralOutcome } from "../../types";

interface ReferralDetailsTabProps {
  referral: Referral;
  users: User[];
  onUpdate: () => void;
}

export function ReferralDetailsTab({
  referral,
  users,
  onUpdate,
}: ReferralDetailsTabProps) {
  const [formData, setFormData] = useState<UpdateReferralDto>({
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
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: () => apiService.fetchRegions(),
  });

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = users.find((u) => u.id === formData.assignedToId);

  const supportOptions = Object.entries(supportLabels).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

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
            fullWidth
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
            value={calculateTriageTime(referral.createdAt, referral.assignedOn)}
          />
          <Field
            label="Length of Time to Contact After Triage"
            value={calculateContactTime(
              referral.assignedOn,
              referral.firstContactMadeOn
            )}
          />
        </div>
      </Section>

      <Section title="Other Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <MultiSelect
            id="currentlyConnectedSupports"
            label="Supports Currently Connected"
            options={supportOptions}
            value={formData.currentlyConnectedSupports || []}
            onChange={(values) =>
              setFormData({ ...formData, currentlyConnectedSupports: values })
            }
            placeholder="Search supports..."
          />
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Current Region
            </label>
            <select
              value={formData.regionId || ""}
              onChange={(e) =>
                setFormData({ ...formData, regionId: e.target.value || null })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            >
              <option value="">— Select Region —</option>
              {regions.map((region: Region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Other Currently Connected Supports
            </label>
            <input
              type="text"
              value={formData.currentlyConnectedSupportsOther || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentlyConnectedSupportsOther: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Specific City/Town
            </label>
            <input
              type="text"
              value={formData.specificCityTown || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specificCityTown: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <MultiSelect
            id="neededSupports"
            label="Needed Supports"
            options={supportOptions}
            value={formData.neededSupports || []}
            onChange={(values) =>
              setFormData({ ...formData, neededSupports: values })
            }
            placeholder="Search supports..."
          />
          <div>
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Other Needed Supports
            </label>
            <input
              type="text"
              value={formData.neededSupportsOther || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  neededSupportsOther: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
              Referral Reason
            </label>
            <textarea
              value={formData.referralSummary || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  referralSummary: e.target.value || null,
                })
              }
              rows={5}
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue resize-y"
            />
          </div>
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
