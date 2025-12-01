import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import {
  RegionType,
  YesNoUnknown,
  ReleaseFromType,
} from "../../schemas/referralSchema";
import {
  SelectField,
  TextInput,
  TextAreaField,
  RadioGroupField,
} from "../form";

interface IndividualInfoSectionProps {
  form: UseFormReturn<ReferralFormData>;
}

export function IndividualInfoSection({ form }: IndividualInfoSectionProps) {
  const { control, watch } = form;

  const currentlyHomeless = watch("currentlyHomeless");
  const pendingRelease = watch("pendingRelease");

  // Only show atRiskOfLosingHousing when currentlyHomeless is explicitly "No" or "Unknown"
  const showAtRiskField =
    currentlyHomeless === "No" || currentlyHomeless === "Unknown";
  const showReleaseDateField = !!pendingRelease;

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
        />

        <SelectField
          name="currentRegion"
          control={control}
          label="Current Region"
          options={RegionType.options}
          isRequired
        />

        <TextInput
          name="specificCityTown"
          control={control}
          label="Current City"
          isRequired
        />

        <TextInput
          name="gainFile"
          control={control}
          label="GAIN File (SA) (Optional)"
        />

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
            name="currentlyHomeless"
            control={control}
            label="Are they currently experiencing homelessness?"
            options={YesNoUnknown.options}
            isRequired
          />
        </div>

        {showAtRiskField && (
          <div className="form-field-full">
            <RadioGroupField
              name="atRiskOfLosingHousing"
              control={control}
              label="Are they currently at risk of losing housing?"
              options={YesNoUnknown.options}
              isRequired
            />
          </div>
        )}

        <SelectField
          name="pendingRelease"
          control={control}
          label="Pending release or recently released? (Optional)"
          options={ReleaseFromType.options}
        />

        {showReleaseDateField && (
          <TextInput
            name="releaseDischargeDate"
            control={control}
            label="Release/Discharge Date"
            type="date"
          />
        )}
      </div>
    </section>
  );
}
