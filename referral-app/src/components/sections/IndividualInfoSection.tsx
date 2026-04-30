import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import {
  YesNoUnknown,
  YesNoUnknownOptions,
  ReleaseFromTypeOptions,
  ReferredByType,
} from "../../schemas/referralSchema";
import {
  SelectField,
  TextInput,
  TextAreaField,
  RadioGroupField,
} from "../form";
import type { Region } from "../../types";

interface IndividualInfoSectionProps {
  readonly form: UseFormReturn<ReferralFormData>;
  readonly regions: Region[];
}

export function IndividualInfoSection({
  form,
  regions,
}: Readonly<IndividualInfoSectionProps>) {
  const { control, watch } = form;

  const experiencingHomelessness = watch("experiencingHomelessness");
  const pendingOrRecentlyReleased = watch("pendingOrRecentlyReleased");
  const referredBy = watch("referredBy");

  // Only show losingHouse when experiencingHomelessness is explicitly "NO" or "UNKNOWN"
  const showAtRiskField =
    experiencingHomelessness === YesNoUnknown.NO ||
    experiencingHomelessness === YesNoUnknown.UNKNOWN;
  const showReleaseDateField = !!pendingOrRecentlyReleased;
  const showGainFile = referredBy === ReferredByType.SDPR_INTERNAL;

  return (
    <section>
      <h2>Individual&apos;s Info</h2>

      <div className="form-grid">
        <TextInput
          name="individualFirstName"
          control={control}
          label="First Name"
          isRequired
        />

        <TextInput
          name="individualMiddleName"
          control={control}
          label="Middle Name (Optional)"
        />

        <TextInput
          name="individualLastName"
          control={control}
          label="Last Name (Optional)"
        />

        <TextInput
          name="individualPreferredName"
          control={control}
          label="Preferred Name (Optional)"
        />

        <TextInput
          name="individualPhone"
          control={control}
          label="Phone Number (Optional)"
          type="tel"
        />

        <TextInput
          name="individualDateOfBirth"
          control={control}
          label="Date of Birth (Optional)"
          type="date"
        />

        <SelectField
          name="regionId"
          control={control}
          label="Current Region"
          options={regions}
          isRequired
        />

        <TextInput
          name="specificCityTown"
          control={control}
          label="Current City"
          isRequired
        />

        {showGainFile && (
          <TextInput
            name="personId"
            control={control}
            label="GAIN File (Optional)"
          />
        )}

        <TextInput
          name="secondaryContact"
          control={control}
          label="Secondary Contact (Optional)"
        />

        <div className="form-field-full">
          <TextAreaField
            name="bestWayToReach"
            control={control}
            label="Best way to reach the individual (Optional)"
          />
        </div>

        <div className="form-field-full">
          <RadioGroupField
            name="experiencingHomelessness"
            control={control}
            label="Are they currently experiencing homelessness?"
            options={YesNoUnknownOptions}
            isRequired
          />
        </div>

        {showAtRiskField && (
          <div className="form-field-full">
            <RadioGroupField
              name="losingHouse"
              control={control}
              label="Are they currently at risk of losing housing?"
              options={YesNoUnknownOptions}
              isRequired
            />
          </div>
        )}

        <SelectField
          name="pendingOrRecentlyReleased"
          control={control}
          label="Pending release or recently released? (Optional)"
          options={ReleaseFromTypeOptions}
        />

        {showReleaseDateField && (
          <TextInput
            name="releaseDate"
            control={control}
            label="Release/Discharge Date"
            type="date"
          />
        )}
      </div>
    </section>
  );
}
