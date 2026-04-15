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
  const { control, watch, setValue, setError, clearErrors } = form;

  const referredBy = watch("referredBy");
  const ministryId = watch("ministryId");
  const agencyTypeId = watch("agencyTypeId");

  const showMinistryFields = referredBy === ReferredByType.PARTNER_MINISTRY;
  const showAgencyFields = referredBy === ReferredByType.PARTNER_AGENCY;

  const selectedMinistry = ministries.find((m) => m.id === ministryId);
  const isOtherMinistry = selectedMinistry?.name?.toLowerCase() === "other";

  const selectedAgencyType = agencyTypes.find((a) => a.id === agencyTypeId);
  const isOtherAgencyType = selectedAgencyType?.name?.toLowerCase() === "other";

  const handleReferredByChange = () => {
    setValue("ministryId", undefined);
    setValue("ministryNameOther", undefined);
    setValue("programArea", undefined);
    setValue("partnerAgencyName", undefined);
    setValue("agencyTypeId", undefined);
    setValue("agencyTypeOther", undefined);
    clearErrors([
      "ministryId",
      "ministryNameOther",
      "partnerAgencyName",
      "agencyTypeId",
      "agencyTypeOther",
    ]);
  };

  const handleMinistryChange = (key: unknown) => {
    const selected = ministries.find((m) => m.id === key);
    if (selected?.name?.toLowerCase() === "other") {
      setError("ministryNameOther", {
        type: "custom",
        message: "Please specify the ministry name",
      });
    } else {
      clearErrors("ministryNameOther");
      setValue("ministryNameOther", undefined);
    }
  };

  const handleAgencyTypeChange = (key: unknown) => {
    const selected = agencyTypes.find((a) => a.id === key);
    if (selected?.name?.toLowerCase() === "other") {
      setError("agencyTypeOther", {
        type: "custom",
        message: "Please specify the agency type",
      });
    } else {
      clearErrors("agencyTypeOther");
      setValue("agencyTypeOther", undefined);
    }
  };

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
          onChangeCallback={handleReferredByChange}
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
            onChangeCallback={handleMinistryChange}
          />

          <TextInput
            name="ministryNameOther"
            control={control}
            label="Specify Ministry (if not listed)"
            isRequired={isOtherMinistry}
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
            isRequired
            onChangeCallback={handleAgencyTypeChange}
          />

          <TextInput
            name="agencyTypeOther"
            control={control}
            label="Specify Agency Type (if not listed)"
            isRequired={isOtherAgencyType}
          />
        </div>
      )}
    </section>
  );
}
