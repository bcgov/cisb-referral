import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import {
  RegionType,
  YesNoUnknown,
  ReleaseFromType,
} from "../../schemas/referralSchema";
import {
  FormField,
  SelectField,
  TextInput,
  TextAreaField,
  RadioGroupField,
} from "../form";

interface IndividualInfoSectionProps {
  form: UseFormReturn<ReferralFormData>;
}

export function IndividualInfoSection({ form }: IndividualInfoSectionProps) {
  const { control } = form;

  return (
    <section>
      <h2>Individual&apos;s Info</h2>

      <FormField>
        <TextInput
          name="individualFirstName"
          control={control}
          label="First Name"
          isRequired
        />
      </FormField>

      <FormField>
        <TextInput
          name="individualMiddleName"
          control={control}
          label="Middle Name"
          description="Optional"
        />
      </FormField>

      <FormField>
        <TextInput
          name="individualLastName"
          control={control}
          label="Last Name"
          description="Optional"
        />
      </FormField>

      <FormField>
        <TextInput
          name="individualPreferredName"
          control={control}
          label="Preferred Name"
          description="Optional"
        />
      </FormField>

      <FormField>
        <TextInput
          name="gainFile"
          control={control}
          label="GAIN File (SA)"
          description="Optional"
        />
      </FormField>

      <FormField>
        <TextInput
          name="individualPhone"
          control={control}
          label="Phone Number"
          type="tel"
          description="Optional"
        />
      </FormField>

      <FormField>
        <TextInput
          name="individualDateOfBirth"
          control={control}
          label="Date of Birth"
          description="Optional (YYYY-MM-DD)"
        />
      </FormField>

      <FormField>
        <SelectField
          name="currentRegion"
          control={control}
          label="Current Region"
          options={RegionType.options}
          isRequired
        />
      </FormField>

      <FormField>
        <TextInput
          name="specificCityTown"
          control={control}
          label="Current City"
          isRequired
        />
      </FormField>

      <FormField>
        <TextInput
          name="secondaryContact"
          control={control}
          label="Is there a secondary contact?"
          description="Optional"
        />
      </FormField>

      <FormField>
        <TextAreaField
          name="bestWayToReach"
          control={control}
          label="Best way to reach the individual"
          description="Optional"
        />
      </FormField>

      <FormField>
        <RadioGroupField
          name="currentlyHomeless"
          control={control}
          label="Are they currently experiencing homelessness?"
          options={YesNoUnknown.options}
          isRequired
        />
      </FormField>

      <FormField>
        <SelectField
          name="pendingRelease"
          control={control}
          label="Are they pending release or recently released?"
          options={ReleaseFromType.options}
          description="Optional"
          placeholder=""
        />
      </FormField>
    </section>
  );
}
