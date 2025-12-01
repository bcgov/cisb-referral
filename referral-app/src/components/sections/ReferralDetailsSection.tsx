import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import {
  ReferredByType,
  MinistryName,
  AgencyType,
} from "../../schemas/referralSchema";
import { FormField, SelectField, TextInput } from "../form";

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

      <FormField>
        <SelectField
          name="referredBy"
          control={control}
          label="Referred by"
          options={ReferredByType.options}
          isRequired
        />
      </FormField>

      {showMinistryFields && (
        <>
          <FormField>
            <SelectField
              name="ministryName"
              control={control}
              label="Name of Ministry"
              options={MinistryName.options}
              isRequired
            />
          </FormField>

          {ministryName === "Other" && (
            <FormField>
              <TextInput
                name="ministryNameOther"
                control={control}
                label="Specify Ministry"
                isRequired
              />
            </FormField>
          )}

          <FormField>
            <TextInput
              name="programArea"
              control={control}
              label="Program Area"
            />
          </FormField>
        </>
      )}

      {showAgencyFields && (
        <>
          <FormField>
            <TextInput
              name="partnerAgencyName"
              control={control}
              label="Partner Agency Name"
              isRequired
            />
          </FormField>

          <FormField>
            <SelectField
              name="agencyType"
              control={control}
              label="Type of Agency"
              options={AgencyType.options}
            />
          </FormField>

          {agencyType === "Other" && (
            <FormField>
              <TextInput
                name="agencyTypeOther"
                control={control}
                label="Specify Agency Type"
                isRequired
              />
            </FormField>
          )}
        </>
      )}

      {showSDPRField && (
        <FormField>
          <TextInput name="personId" control={control} label="Person ID" />
        </FormField>
      )}

      <FormField>
        <TextInput
          name="referrerContactName"
          control={control}
          label="Full Name"
          isRequired
        />
      </FormField>

      <FormField>
        <TextInput
          name="referrerPhone"
          control={control}
          label="Phone Number"
          type="tel"
          isRequired
        />
      </FormField>

      <FormField>
        <TextInput
          name="referrerEmail"
          control={control}
          label="Email"
          type="email"
          isRequired
        />
      </FormField>
    </section>
  );
}
