import { Section, FieldGrid, Field } from "../ui";
import { formatDate } from "../../utils";
import type { Referral } from "../../types";

const yesNoLabels: Record<string, string> = {
  YES: "Yes",
  NO: "No",
  UNKNOWN: "Unknown",
};

interface ReferrerIndividualTabProps {
  referral: Referral;
}

export function ReferrerIndividualTab({
  referral,
}: ReferrerIndividualTabProps) {
  return (
    <>
      <Section title="Referrer Info">
        <FieldGrid columns={3}>
          <Field
            label="Referred By: Contact Name"
            value={referral.referrerContactName}
          />
          <Field
            label="Referred By: Email"
            value={referral.referrerContactEmail}
          />
          <Field
            label="Referred By: Phone Number"
            value={referral.referrerContactPhone || "—"}
          />
        </FieldGrid>
      </Section>

      <Section title="Individual's Info">
        <FieldGrid columns={3}>
          <Field
            label="Individual's First Name"
            value={referral.individualFirstName}
          />
          <Field label="GAIN File (GA)" value={referral.gainFile || "—"} />
          <Field
            label="Experiencing Homelessness"
            value={
              referral.currentlyHomeless
                ? yesNoLabels[referral.currentlyHomeless] ||
                  referral.currentlyHomeless
                : "—"
            }
          />
          <Field
            label="Individual's Middle Name"
            value={referral.individualMiddleName || "—"}
          />
          <Field
            label="Individual's Phone Number"
            value={referral.individualPhone || "—"}
          />
          <Field
            label="At Risk of Losing Housing"
            value={
              referral.losingHousing
                ? yesNoLabels[referral.losingHousing] || referral.losingHousing
                : "—"
            }
          />
          <Field
            label="Individual's Last Name"
            value={referral.individualLastName || "—"}
          />
          <Field
            label="Secondary Contact"
            value={referral.secondaryContact || "—"}
          />
          <Field
            label="Pending or Recently Released"
            value={
              referral.pendingRelease
                ? yesNoLabels[referral.pendingRelease] ||
                  referral.pendingRelease
                : "—"
            }
          />
          <Field
            label="Individual's Preferred Name"
            value={referral.individualPreferredName || "—"}
          />
          <Field
            label="Best Way to Reach"
            value={referral.bestWayToReach || "—"}
          />
          <Field
            label="Release/Discharge Date"
            value={formatDate(referral.releaseDate)}
          />
          <Field
            label="Individual's Date of Birth"
            value={formatDate(referral.individualDateOfBirth)}
          />
        </FieldGrid>
      </Section>
    </>
  );
}
