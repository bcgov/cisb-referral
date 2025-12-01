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
  TextArea,
  RadioGroup,
} from "../form";

interface IndividualInfoSectionProps {
  form: UseFormReturn<ReferralFormData>;
}

export function IndividualInfoSection({ form }: IndividualInfoSectionProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <section>
      <h2>Individual&apos;s Info</h2>

      <FormField
        label="First Name (Required)"
        htmlFor="individualFirstName"
        required
        error={errors.individualFirstName}
      >
        <TextInput
          id="individualFirstName"
          registration={register("individualFirstName")}
        />
      </FormField>

      <FormField label="Middle Name (Optional)" htmlFor="individualMiddleName">
        <TextInput
          id="individualMiddleName"
          registration={register("individualMiddleName")}
        />
      </FormField>

      <FormField label="Last Name (Optional)" htmlFor="individualLastName">
        <TextInput
          id="individualLastName"
          registration={register("individualLastName")}
        />
      </FormField>

      <FormField
        label="Preferred Name (Optional)"
        htmlFor="individualPreferredName"
      >
        <TextInput
          id="individualPreferredName"
          registration={register("individualPreferredName")}
        />
      </FormField>

      <FormField label="GAIN File (SA) (Optional)" htmlFor="gainFile">
        <TextInput id="gainFile" registration={register("gainFile")} />
      </FormField>

      <FormField label="Phone Number (Optional)" htmlFor="individualPhone">
        <TextInput
          id="individualPhone"
          type="tel"
          registration={register("individualPhone")}
        />
      </FormField>

      <FormField
        label="Date of Birth (Optional)"
        htmlFor="individualDateOfBirth"
      >
        <TextInput
          id="individualDateOfBirth"
          type="date"
          registration={register("individualDateOfBirth")}
        />
      </FormField>

      <FormField
        label="Current Region (Required)"
        htmlFor="currentRegion"
        required
        error={errors.currentRegion}
      >
        <SelectField
          id="currentRegion"
          options={RegionType.options}
          registration={register("currentRegion")}
        />
      </FormField>

      <FormField
        label="Current City (Required)"
        htmlFor="specificCityTown"
        required
        error={errors.specificCityTown}
      >
        <TextInput
          id="specificCityTown"
          registration={register("specificCityTown")}
        />
      </FormField>

      <FormField
        label="Is there a secondary contact? (Optional)"
        htmlFor="secondaryContact"
      >
        <TextInput
          id="secondaryContact"
          registration={register("secondaryContact")}
        />
      </FormField>

      <FormField
        label="Best way to reach the individual (Optional)"
        htmlFor="bestWayToReach"
      >
        <TextArea
          id="bestWayToReach"
          registration={register("bestWayToReach")}
        />
      </FormField>

      <FormField
        label="Are they currently experiencing homelessness? (Required)"
        htmlFor="currentlyHomeless"
        required
        error={errors.currentlyHomeless}
      >
        <RadioGroup
          name="currentlyHomeless"
          options={YesNoUnknown.options}
          registration={register("currentlyHomeless")}
        />
      </FormField>

      <FormField
        label="Are they pending release or recently released? (Optional)"
        htmlFor="pendingRelease"
      >
        <SelectField
          id="pendingRelease"
          options={ReleaseFromType.options}
          registration={register("pendingRelease")}
          placeholder=""
        />
      </FormField>
    </section>
  );
}
