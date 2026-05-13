import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormInput } from "../../schemas/referralSchema";
import {
  ReferredByType,
  ReferredByTypeOptions,
} from "../../schemas/referralSchema";
import { SelectField, TextInput } from "../form";
import type { Ministry, AgencyType } from "../../types";

interface ReferralDetailsSectionProps {
  readonly form: UseFormReturn<ReferralFormInput>;
  readonly ministries: Ministry[];
  readonly agencyTypes: AgencyType[];
}

export function ReferralDetailsSection({
  form,
  ministries,
  agencyTypes,
}: Readonly<ReferralDetailsSectionProps>) {
  const { control, watch, setValue, clearErrors } = form;

  const referredBy = watch("referredBy");
  const ministryId = watch("ministryId");
  const agencyTypeId = watch("agencyTypeId");

  const showMinistryFields = referredBy === ReferredByType.PARTNER_MINISTRY;
  const showAgencyFields = referredBy === ReferredByType.PARTNER_AGENCY;

  const isOtherOption = (name: string | undefined): boolean =>
    name?.trim().toLowerCase() === "other";

  const selectedMinistry = ministries.find((m) => m.id === ministryId);
  const isOtherMinistry = isOtherOption(selectedMinistry?.name);

  const selectedAgencyType = agencyTypes.find((a) => a.id === agencyTypeId);
  const isOtherAgencyType = isOtherOption(selectedAgencyType?.name);

  const validateRequiredOtherField = (
    value: unknown,
    isRequired: boolean,
    message: string,
  ): true | string => {
    const trimmedValue = typeof value === "string" ? value.trim() : "";
    return !isRequired || trimmedValue.length > 0 ? true : message;
  };

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
    const isOther = isOtherOption(selected?.name);
    if (isOther) {
      return;
    }

    clearErrors("ministryNameOther");
    setValue("ministryNameOther", undefined);
  };

  const handleAgencyTypeChange = (key: unknown) => {
    const selected = agencyTypes.find((a) => a.id === key);
    const isOther = isOtherOption(selected?.name);
    if (isOther) {
      return;
    }

    clearErrors("agencyTypeOther");
    setValue("agencyTypeOther", undefined);
  };

  const handleMinistryOtherInputChange = (value: string) => {
    if (!isOtherMinistry || value.trim()) {
      clearErrors("ministryNameOther");
    }
  };

  const handleAgencyTypeOtherInputChange = (value: string) => {
    if (!isOtherAgencyType || value.trim()) {
      clearErrors("agencyTypeOther");
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
            rules={{
              validate: (value) =>
                validateRequiredOtherField(
                  value,
                  isOtherMinistry,
                  "Please specify the ministry name",
                ),
            }}
            onChangeCallback={handleMinistryOtherInputChange}
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
            rules={{
              validate: (value) =>
                validateRequiredOtherField(
                  value,
                  isOtherAgencyType,
                  "Please specify the agency type",
                ),
            }}
            onChangeCallback={handleAgencyTypeOtherInputChange}
          />
        </div>
      )}
    </section>
  );
}
