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
  const { control, watch, setValue, setError, clearErrors, getValues } = form;

  const referredBy = watch("referredBy");
  const ministryId = watch("ministryId");
  const agencyTypeId = watch("agencyTypeId");

  const showMinistryFields = referredBy === ReferredByType.PARTNER_MINISTRY;
  const showAgencyFields = referredBy === ReferredByType.PARTNER_AGENCY;

  const selectedMinistry = ministries.find((m) => m.id === ministryId);
  const isOtherMinistry = selectedMinistry?.name?.toLowerCase() === "other";

  const selectedAgencyType = agencyTypes.find((a) => a.id === agencyTypeId);
  const isOtherAgencyType = selectedAgencyType?.name?.toLowerCase() === "other";

  const ministryIdRules = {
    validate: (value: unknown) => {
      if (referredBy !== ReferredByType.PARTNER_MINISTRY) {
        return true;
      }

      return value ? true : "Please select a ministry";
    },
  };

  const partnerAgencyNameRules = {
    validate: (value: unknown) => {
      if (referredBy !== ReferredByType.PARTNER_AGENCY) {
        return true;
      }

      if (typeof value === "string" && value.trim().length > 0) {
        return true;
      }

      return "Please enter the partner agency name";
    },
  };

  const agencyTypeIdRules = {
    validate: (value: unknown) => {
      if (referredBy !== ReferredByType.PARTNER_AGENCY) {
        return true;
      }

      return value ? true : "Please select the type of agency";
    },
  };

  const setRequiredOtherError = (
    field: "ministryNameOther" | "agencyTypeOther",
    message: string,
  ) => {
    setError(field, {
      type: "custom",
      message,
    });
  };

  const clearOrSetRequiredOtherError = (
    field: "ministryNameOther" | "agencyTypeOther",
    value: string,
    message: string,
  ) => {
    if (value.trim()) {
      clearErrors(field);
      return;
    }

    setRequiredOtherError(field, message);
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
    const isOther = selected?.name?.toLowerCase() === "other";
    if (isOther) {
      clearOrSetRequiredOtherError(
        "ministryNameOther",
        getValues("ministryNameOther") ?? "",
        "Please specify the ministry name",
      );
      return;
    }

    clearErrors("ministryNameOther");
    setValue("ministryNameOther", undefined);
  };

  const handleAgencyTypeChange = (key: unknown) => {
    const selected = agencyTypes.find((a) => a.id === key);
    const isOther = selected?.name?.toLowerCase() === "other";
    if (isOther) {
      clearOrSetRequiredOtherError(
        "agencyTypeOther",
        getValues("agencyTypeOther") ?? "",
        "Please specify the agency type",
      );
      return;
    }

    clearErrors("agencyTypeOther");
    setValue("agencyTypeOther", undefined);
  };

  const handleMinistryOtherInputChange = (value: string) => {
    if (!isOtherMinistry) {
      clearErrors("ministryNameOther");
      return;
    }

    clearOrSetRequiredOtherError(
      "ministryNameOther",
      value,
      "Please specify the ministry name",
    );
  };

  const handleAgencyTypeOtherInputChange = (value: string) => {
    if (!isOtherAgencyType) {
      clearErrors("agencyTypeOther");
      return;
    }

    clearOrSetRequiredOtherError(
      "agencyTypeOther",
      value,
      "Please specify the agency type",
    );
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
            rules={ministryIdRules}
            onChangeCallback={handleMinistryChange}
          />

          <TextInput
            name="ministryNameOther"
            control={control}
            label="Specify Ministry (if not listed)"
            isRequired={isOtherMinistry}
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
            rules={partnerAgencyNameRules}
          />

          <SelectField
            name="agencyTypeId"
            control={control}
            label="Type of Agency"
            options={agencyTypes}
            isRequired
            rules={agencyTypeIdRules}
            onChangeCallback={handleAgencyTypeChange}
          />

          <TextInput
            name="agencyTypeOther"
            control={control}
            label="Specify Agency Type (if not listed)"
            isRequired={isOtherAgencyType}
            onChangeCallback={handleAgencyTypeOtherInputChange}
          />
        </div>
      )}
    </section>
  );
}
