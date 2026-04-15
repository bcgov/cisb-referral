import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import {
  ReferredByType,
  ReferredByTypeOptions,
} from "../../schemas/referralSchema";
import { SelectField, TextInput } from "../form";
import type { Ministry, AgencyType } from "../../types";

interface ReferralDetailsSectionProps {
  readonly form: UseFormReturn<ReferralFormData>;
  readonly ministries: Ministry[];
  readonly agencyTypes: AgencyType[];
}

export function ReferralDetailsSection({
  form,
  ministries,
  agencyTypes,
}: Readonly<ReferralDetailsSectionProps>) {
  const { control, watch } = form;

  const referredBy = watch("referredBy");

  const showMinistryFields = referredBy === ReferredByType.PARTNER_MINISTRY;
  const showAgencyFields = referredBy === ReferredByType.PARTNER_AGENCY;

  return (
    <section>
      <h2>Referral Details</h2>

      <div className="form-grid">
        <SelectField
          name="referredBy"
          control={control}
          label="Referred By"
          options={ReferredByTypeOptions}
          isRequired
        />

        <TextInput
          name="referrerContactName"
          control={control}
          label="Full Name"
          isRequired
        />

        <TextInput
          name="referrerPhone"
          control={control}
          label="Phone Number"
          type="tel"
          isRequired
        />

        <TextInput
          name="referrerEmail"
          control={control}
          label="Email"
          type="email"
          isRequired
        />
      </div>

      {showMinistryFields && (
        <div className="form-grid">
          <SelectField
            name="ministryId"
            control={control}
            label="Name of Ministry"
            options={ministries}
            isRequired
          />

          <TextInput
            name="ministryNameOther"
            control={control}
            label="Specify Ministry (if not listed)"
          />

          <TextInput
            name="programArea"
            control={control}
            label="Program Area"
          />
        </div>
      )}

      {showAgencyFields && (
        <div className="form-grid">
          <TextInput
            name="partnerAgencyName"
            control={control}
            label="Partner Agency Name"
            isRequired
          />

          <SelectField
            name="agencyTypeId"
            control={control}
            label="Type of Agency"
            options={agencyTypes}
          />

          <TextInput
            name="agencyTypeOther"
            control={control}
            label="Specify Agency Type (if not listed)"
          />
        </div>
      )}
    </section>
  );
}
