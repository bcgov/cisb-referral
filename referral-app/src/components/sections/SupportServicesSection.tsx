import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import { SupportType } from "../../schemas/referralSchema";
import { FormField, TextInput, TextAreaField, MultiSelectField } from "../form";

interface SupportServicesSectionProps {
  form: UseFormReturn<ReferralFormData>;
}

export function SupportServicesSection({ form }: SupportServicesSectionProps) {
  const { control, watch } = form;

  const currentlyConnectedSupports = watch("currentlyConnectedSupports");
  const neededSupports = watch("neededSupports");

  const showCurrentSupportsOther =
    currentlyConnectedSupports?.includes("Others");
  const showNeededSupportsOther = neededSupports?.includes("Others");

  return (
    <section>
      <h2>Support Services</h2>

      <FormField>
        <MultiSelectField
          id="currentlyConnectedSupports"
          name="currentlyConnectedSupports"
          control={control}
          options={SupportType.options}
          placeholder="Select supports..."
          label="Which supports are they currently connected with?"
        />
      </FormField>

      {showCurrentSupportsOther && (
        <FormField>
          <TextInput
            name="currentlyConnectedSupportsOther"
            control={control}
            label="Specify Other Supports"
            isRequired
          />
        </FormField>
      )}

      <FormField>
        <MultiSelectField
          id="neededSupports"
          name="neededSupports"
          control={control}
          options={SupportType.options}
          placeholder="Select supports..."
          label="Which supports do they need?"
        />
      </FormField>

      {showNeededSupportsOther && (
        <FormField>
          <TextInput
            name="neededSupportsOther"
            control={control}
            label="Specify Other Supports Needed"
            isRequired
          />
        </FormField>
      )}

      <FormField>
        <TextAreaField
          name="referralSummary"
          control={control}
          label="Brief summary of the reason for referral"
          description="Optional"
          maxLength={2000}
        />
      </FormField>
    </section>
  );
}
