import { Section, FieldGrid, Field } from "../ui";
import { formatDate } from "../../utils";
import type { Referral } from "../../types";

interface ReferrerIndividualTabProps {
  referral: Referral;
}

export function ReferrerIndividualTab({
  referral,
}: ReferrerIndividualTabProps) {
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
