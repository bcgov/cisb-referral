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
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const referredBy = watch("referredBy");
  const ministryName = watch("ministryName");
  const agencyType = watch("agencyType");

  const showMinistryFields = referredBy === "Partner Ministry";
  const showAgencyFields = referredBy === "Partner Agency";
  const showSDPRField = referredBy === "SDPR Internal";

  return (
    <section>
      <h2>Referral Details</h2>

      <FormField
        label="Referred by (Required)"
        htmlFor="referredBy"
        required
        error={errors.referredBy}
      >
        <SelectField
          id="referredBy"
          options={ReferredByType.options}
          registration={register("referredBy")}
        />
      </FormField>

      {showMinistryFields && (
        <>
          <FormField
            label="Name of Ministry"
            htmlFor="ministryName"
            required
            error={errors.ministryName}
          >
            <SelectField
              id="ministryName"
              options={MinistryName.options}
              registration={register("ministryName")}
            />
          </FormField>

          {ministryName === "Other" && (
            <FormField
              label="Specify Ministry"
              htmlFor="ministryNameOther"
              required
              error={errors.ministryNameOther}
            >
              <TextInput
                id="ministryNameOther"
                registration={register("ministryNameOther")}
              />
            </FormField>
          )}

          <FormField label="Program Area" htmlFor="programArea">
            <TextInput
              id="programArea"
              registration={register("programArea")}
            />
          </FormField>
        </>
      )}

      {showAgencyFields && (
        <>
          <FormField
            label="Partner Agency Name"
            htmlFor="partnerAgencyName"
            required
            error={errors.partnerAgencyName}
          >
            <TextInput
              id="partnerAgencyName"
              registration={register("partnerAgencyName")}
            />
          </FormField>

          <FormField label="Type of Agency" htmlFor="agencyType">
            <SelectField
              id="agencyType"
              options={AgencyType.options}
              registration={register("agencyType")}
            />
          </FormField>

          {agencyType === "Other" && (
            <FormField
              label="Specify Agency Type"
              htmlFor="agencyTypeOther"
              required
              error={errors.agencyTypeOther}
            >
              <TextInput
                id="agencyTypeOther"
                registration={register("agencyTypeOther")}
              />
            </FormField>
          )}
        </>
      )}

      {showSDPRField && (
        <FormField label="Person ID" htmlFor="personId">
          <TextInput id="personId" registration={register("personId")} />
        </FormField>
      )}

      <FormField
        label="Full Name (Required)"
        htmlFor="referrerContactName"
        required
        error={errors.referrerContactName}
      >
        <TextInput
          id="referrerContactName"
          registration={register("referrerContactName")}
        />
      </FormField>

      <FormField
        label="Phone Number (Required)"
        htmlFor="referrerPhone"
        required
        error={errors.referrerPhone}
      >
        <TextInput
          id="referrerPhone"
          type="tel"
          registration={register("referrerPhone")}
        />
      </FormField>

      <FormField
        label="Email (Required)"
        htmlFor="referrerEmail"
        required
        error={errors.referrerEmail}
      >
        <TextInput
          id="referrerEmail"
          type="email"
          registration={register("referrerEmail")}
        />
      </FormField>
    </section>
  );
}
