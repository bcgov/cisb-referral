import { useMemo, useState } from "react";
import { Section, TextInput, DateInput, SelectInput } from "../ui";
import { apiService } from "../../services";
import { yesNoUnknownLabels, releaseFromLabels } from "../../constants";
import { getChangedFields } from "../../utils";
import type { Referral, UpdateReferralDto } from "../../types";

const YES_NO_OPTIONS = [
  { value: "", label: "— Select —" },
  ...Object.entries(yesNoUnknownLabels).map(([value, label]) => ({
    value,
    label,
  })),
];

const RELEASE_FROM_OPTIONS = [
  { value: "", label: "— Select —" },
  ...Object.entries(releaseFromLabels).map(([value, label]) => ({
    value,
    label,
  })),
];

interface ReferrerIndividualTabProps {
  referral: Referral;
  onUpdate: () => void;
}

export function ReferrerIndividualTab({
  referral,
  onUpdate,
}: Readonly<ReferrerIndividualTabProps>) {
  const initialFormData = useMemo<UpdateReferralDto>(
    () => ({
      referrerContactName: referral.referrerContactName,
      referrerEmail: referral.referrerEmail,
      referrerPhone: referral.referrerPhone,
      individualFirstName: referral.individualFirstName,
      individualMiddleName: referral.individualMiddleName,
      individualLastName: referral.individualLastName,
      individualPreferredName: referral.individualPreferredName,
      individualDateOfBirth: referral.individualDateOfBirth,
      individualPhone: referral.individualPhone,
      personId: referral.personId,
      secondaryContact: referral.secondaryContact,
      bestWayToReach: referral.bestWayToReach,
      experiencingHomelessness: referral.experiencingHomelessness,
      losingHouse: referral.losingHouse,
      pendingOrRecentlyReleased: referral.pendingOrRecentlyReleased,
      releaseDate: referral.releaseDate,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [referral.id],
  );
  const [formData, setFormData] = useState<UpdateReferralDto>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateField = <K extends keyof UpdateReferralDto>(
    field: K,
    value: UpdateReferralDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          Changes saved successfully!
        </div>
      )}

      <Section title="Referrer Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <TextInput
            label="Referred By: Contact Name"
            value={formData.referrerContactName}
            onChange={(v) => updateField("referrerContactName", v || "")}
            required
          />
          <TextInput
            label="Referred By: Email"
            type="email"
            value={formData.referrerEmail}
            onChange={(v) => updateField("referrerEmail", v || "")}
            required
          />
          <TextInput
            label="Referred By: Phone Number"
            type="tel"
            value={formData.referrerPhone}
            onChange={(v) => updateField("referrerPhone", v)}
          />
        </div>
      </Section>

      <Section title="Individual's Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <TextInput
            label="Individual's First Name"
            value={formData.individualFirstName}
            onChange={(v) => updateField("individualFirstName", v || "")}
            required
          />
          <TextInput
            label="GAIN File"
            value={formData.personId}
            onChange={(v) => updateField("personId", v)}
          />
          <SelectInput
            label="Experiencing Homelessness"
            value={formData.experiencingHomelessness}
            onChange={(v) => updateField("experiencingHomelessness", v)}
            options={YES_NO_OPTIONS}
          />

          <TextInput
            label="Individual's Middle Name"
            value={formData.individualMiddleName}
            onChange={(v) => updateField("individualMiddleName", v)}
          />
          <TextInput
            label="Individual's Phone Number"
            type="tel"
            value={formData.individualPhone}
            onChange={(v) => updateField("individualPhone", v)}
          />
          <SelectInput
            label="At Risk of Losing Housing"
            value={formData.losingHouse}
            onChange={(v) => updateField("losingHouse", v)}
            options={YES_NO_OPTIONS}
          />

          <TextInput
            label="Individual's Last Name"
            value={formData.individualLastName}
            onChange={(v) => updateField("individualLastName", v)}
          />
          <TextInput
            label="Secondary Contact"
            value={formData.secondaryContact}
            onChange={(v) => updateField("secondaryContact", v)}
          />
          <SelectInput
            label="Pending or Recently Released"
            value={formData.pendingOrRecentlyReleased}
            onChange={(v) => updateField("pendingOrRecentlyReleased", v)}
            options={RELEASE_FROM_OPTIONS}
          />

          <TextInput
            label="Individual's Preferred Name"
            value={formData.individualPreferredName}
            onChange={(v) => updateField("individualPreferredName", v)}
          />
          <TextInput
            label="Best Way to Reach"
            value={formData.bestWayToReach}
            onChange={(v) => updateField("bestWayToReach", v)}
          />
          <DateInput
            label="Release/Discharge Date"
            value={formData.releaseDate}
            onChange={(v) => updateField("releaseDate", v)}
          />

          <DateInput
            label="Individual's Date of Birth"
            value={formData.individualDateOfBirth}
            onChange={(v) => updateField("individualDateOfBirth", v)}
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
