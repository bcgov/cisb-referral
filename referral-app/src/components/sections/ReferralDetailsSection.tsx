import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import {
  ReferredByType,
  MinistryName,
  AgencyType,
} from "../../schemas/referralSchema";
import { SelectField, TextInput } from "../form";

interface ReferralDetailsSectionProps {
  form: UseFormReturn<ReferralFormData>;
}

export function ReferralDetailsSection({ form }: ReferralDetailsSectionProps) {
  const { control, watch } = form;

  const referredBy = watch("referredBy");
  const ministryName = watch("ministryName");
  const agencyType = watch("agencyType");

  const showMinistryFields = referredBy === "Partner Ministry";
  const showAgencyFields = referredBy === "Partner Agency";
  const showSDPRField = referredBy === "SDPR Internal";

  return (
    <section>
      <h2>Referral Details</h2>

      <div className="form-grid">
        <SelectField
          name="referredBy"
          control={control}
          label="Referred By"
          options={ReferredByType.options}
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
            name="ministryName"
            control={control}
            label="Name of Ministry"
            options={MinistryName.options}
            isRequired
          />

          {ministryName === "Other" && (
            <TextInput
              name="ministryNameOther"
              control={control}
              label="Specify Ministry"
              isRequired
            />
          )}

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
            name="agencyType"
            control={control}
            label="Type of Agency"
            options={AgencyType.options}
          />

          {agencyType === "Other" && (
            <TextInput
              name="agencyTypeOther"
              control={control}
              label="Specify Agency Type"
              isRequired
            />
          )}
        </div>
      )}

      {showSDPRField && (
        <div className="form-grid">
          <TextInput name="personId" control={control} label="Person ID" />
        </div>
      )}
    </section>
  );
}
